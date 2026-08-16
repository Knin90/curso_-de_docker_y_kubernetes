// ─── Sidebar: índice de niveles por etapa, TOC de secciones del nivel
// actual (scrollspy) y el drawer móvil. ───
import { niveles, getNivel } from '../data/niveles.js';
import { isCompleted, completedCount, getReadSections, toggleSectionRead } from '../progress.js';
import { SECTION_ICONS } from './render.js';
import { sceneState } from './scene-state.js';
import { renderLevelProgress } from './progress-ui.js';

export function buildSidebar(currentId, nivel) {
  const list = document.getElementById('sidebar-list');
  const groups = [
    { label: 'Etapa I — Docker', etapa: 'docker', ids: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 13] },
    { label: 'Etapa II — Compose', etapa: 'compose', ids: [10, 11, 12, 14] },
    { label: 'Etapa III — Kubernetes', etapa: 'k8s', ids: [15, 16, 17, 18, 19, 20, 21, 22] },
  ];

  // Índice de secciones del nivel actual (scrollspy) con checkbox de leído
  if (nivel?.sections?.length) {
    const readIdx = new Set(getReadSections(nivel.id));
    const toc = document.createElement('div');
    toc.className = 'sidebar__toc';
    toc.innerHTML = `
      <div class="sidebar__toc-label">
        <span>En este nivel</span>
        <span class="sidebar__toc-count">${nivel.sections.length}</span>
      </div>
      <nav class="sidebar__toc-list" aria-label="Secciones del nivel">
        ${nivel.sections
          .map(
            (s, i) => `
          <div class="toc-item${readIdx.has(i) ? ' done' : ''}" data-target="nivel-sec-${i}" data-sec="${i}">
            <button class="toc-item__check" data-sec="${i}" aria-pressed="${readIdx.has(i)}"
              aria-label="${readIdx.has(i) ? `Sección ${i + 1} leída` : `Marcar sección ${i + 1} como leída`}"
              title="Marcar como leída"><i class="ph ph-check" aria-hidden="true"></i></button>
            <a class="toc-item__link" href="#nivel-sec-${i}">
              <span class="toc-item__icon">${SECTION_ICONS[s.type] ?? ''}</span>
              <span class="toc-item__title">${s.title}</span>
            </a>
          </div>`,
          )
          .join('')}
      </nav>
      <div class="sidebar__toc-progress">
        <span class="sidebar__toc-progress-label">Leído</span>
        <span class="sidebar__toc-progress-count">${readIdx.size} / ${nivel.sections.length}</span>
        <div class="sidebar__toc-progress-track"><div class="sidebar__toc-progress-fill" style="width:${(readIdx.size / nivel.sections.length) * 100}%"></div></div>
      </div>`;
    list.appendChild(toc);
  }

  // Progreso general del curso (completados reales, no posición)
  const progress = document.createElement('div');
  progress.className = 'sidebar__progress';
  list.appendChild(progress);
  const renderProgress = () => {
    const done = completedCount();
    progress.innerHTML = `
      <div class="sidebar__progress-top">
        <span class="sidebar__progress-label">Tu progreso</span>
        <span class="sidebar__progress-count">${done} / ${niveles.length}</span>
      </div>
      <div class="sidebar__progress-track"><div class="sidebar__progress-fill" style="width:${(done / niveles.length) * 100}%"></div></div>`;
  };
  renderProgress();

  groups.forEach((group) => {
    const label = document.createElement('div');
    label.className = 'sidebar__group-label';
    label.innerHTML = `<span class="sidebar__group-dot sidebar__group-dot--${group.etapa}"></span>${group.label}`;
    list.appendChild(label);

    group.ids.forEach((id) => {
      const nivel = getNivel(id);
      if (!nivel) return;
      const item = document.createElement('a');
      item.className =
        'sidebar__item' + (id === currentId ? ' active' : '') + (isCompleted(id) ? ' done' : '');
      item.href = `?id=${id}`;
      item.dataset.id = String(id);
      item.innerHTML = `
        <span class="sidebar__item-num">${String(id).padStart(2, '0')}</span>
        <span class="sidebar__item-name">${nivel.title}</span>
        <span class="sidebar__item-check" aria-hidden="true"><i class="ph ph-check"></i></span>`;
      list.appendChild(item);
    });
  });

  // Expone la actualización para el toggle del header
  window.__refreshSidebar = () => {
    renderProgress();
    list.querySelectorAll('.sidebar__item').forEach((item) => {
      const id = parseInt(item.dataset.id ?? '-1', 10);
      item.classList.toggle('done', isCompleted(id));
    });
  };
}

// ─── Scrollspy: índice de secciones ───
export function initSectionSpy(nivelId) {
  const tocList = document.querySelector('.sidebar__toc-list');
  if (!tocList) return;

  const items = [...tocList.querySelectorAll('.toc-item')];
  if (!items.length) return;

  const sections = items.map((it) => document.getElementById(it.dataset.target)).filter(Boolean);
  if (!sections.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NAV_OFFSET = 84; // nav fija (60px) + barra de progreso (2px) + respiro
  const ACTIVATION_LINE = 120; // línea de lectura: ~120px bajo el tope

  let activeIndex = -1;
  const setActive = (i) => {
    if (i === activeIndex) return;
    activeIndex = i;
    items.forEach((it, idx) => {
      const on = idx === i;
      it.classList.toggle('active', on);
      if (on) it.setAttribute('aria-current', 'location');
      else it.removeAttribute('aria-current');
    });
  };

  // Modo escenas: las secciones viven en un stage fijo, así que el índice
  // activo lo maneja initSceneZoom (vía sceneState.setActive) y los clics
  // desplazan el scroll hasta la posición del módulo en el escenario.
  if (sceneState.enabled) {
    sceneState.setActive = setActive;
    tocList.addEventListener('click', (e) => {
      const check = e.target.closest('.toc-item__check');
      if (check) {
        toggleSectionRead(nivelId, parseInt(check.dataset.sec, 10));
        renderLevelProgress(nivelId);
        return;
      }
      const item = e.target.closest('.toc-item');
      if (!item) return;
      e.preventDefault();
      sceneState.scrollTo?.(parseInt(item.dataset.sec, 10));
      // En móvil, cerrar el sidebar al navegar
      document.getElementById('sidebar')?.classList.remove('open');
    });
    return;
  }

  // Scrollspy determinista por posición: la última sección cuyo tope haya
  // pasado la línea de lectura es la activa. Sin ambigüedad con secciones
  // cortas, y garantiza el primer item activo en carga.
  const tops = () => sections.map((sec) => sec.getBoundingClientRect().top + window.scrollY);
  const update = () => {
    const line = window.scrollY + ACTIVATION_LINE;
    const positions = tops();
    let i = 0;
    for (let k = 0; k < positions.length; k++) {
      if (positions[k] <= line) i = k;
      else break;
    }
    // Al llegar al final de la página, la última sección queda activa
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      i = sections.length - 1;
    }
    setActive(i);
  };

  // Throttle con rAF para no recalcular en cada frame de scroll
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  // Seguro de layout: si fuentes o imágenes desplazan el contenido tras la
  // carga, recalcular las posiciones sin necesidad de scroll.
  window.addEventListener('load', onScroll, { once: true });
  update(); // estado inicial: primer item activo si no hay scroll

  // Click: el checkbox alterna “leída”; el enlace hace scroll suave al ancla
  tocList.addEventListener('click', (e) => {
    const check = e.target.closest('.toc-item__check');
    if (check) {
      const sec = parseInt(check.dataset.sec, 10);
      toggleSectionRead(nivelId, sec);
      renderLevelProgress(nivelId);
      return;
    }

    const item = e.target.closest('.toc-item');
    if (!item) return;
    e.preventDefault();
    const target = document.getElementById(item.dataset.target);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
    // En móvil, cerrar el sidebar al navegar
    document.getElementById('sidebar')?.classList.remove('open');
  });
}

// ─── Sidebar mobile ───
export function setupSidebarMobile() {
  const sidebar = document.getElementById('sidebar');
  const openBtn = document.getElementById('sidebar-open-btn');
  const closeBtn = document.getElementById('sidebar-toggle');

  openBtn?.addEventListener('click', () => sidebar.classList.add('open'));
  closeBtn?.addEventListener('click', () => sidebar.classList.remove('open'));

  sidebar.addEventListener('click', (e) => {
    if (e.target.closest('.sidebar__item')) {
      sidebar.classList.remove('open');
    }
  });
}
