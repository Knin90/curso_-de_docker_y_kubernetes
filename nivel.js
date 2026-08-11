import { niveles, getNivel } from './data/niveles.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initAtmosphere } from './atmosphere.js';
import { initTheme } from './theme.js';
import {
  isCompleted, toggleCompleted, setLastVisited, completedCount,
  getReadSections, toggleSectionRead,
  getFeedback, setFeedbackVote, setFeedbackComment,
} from './progress.js';

// Tipografías auto-hospedadas + iconos Phosphor
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@phosphor-icons/web/regular';

gsap.registerPlugin(ScrollTrigger);

// ─── Routing ───
function getCurrentId() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id') ?? '0', 10);
  return isNaN(id) ? 0 : Math.max(0, Math.min(id, niveles.length - 1));
}

function navigate(id) {
  window.location.search = `?id=${id}`;
}

// ─── Sidebar ───
function buildSidebar(currentId, nivel) {
  const list = document.getElementById('sidebar-list');
  const groups = [
    { label: 'Etapa I — Docker', etapa: 'docker', ids: [0,1,2,3,4,5,6,7,8,9] },
    { label: 'Etapa II — Compose', etapa: 'compose', ids: [10,11,12,13,14] },
    { label: 'Etapa III — Kubernetes', etapa: 'k8s', ids: [15,16,17,18,19,20,21,22] },
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
        ${nivel.sections.map((s, i) => `
          <div class="toc-item${readIdx.has(i) ? ' done' : ''}" data-target="nivel-sec-${i}" data-sec="${i}">
            <button class="toc-item__check" data-sec="${i}" aria-pressed="${readIdx.has(i)}"
              aria-label="${readIdx.has(i) ? `Sección ${i + 1} leída` : `Marcar sección ${i + 1} como leída`}"
              title="Marcar como leída"><i class="ph ph-check" aria-hidden="true"></i></button>
            <a class="toc-item__link" href="#nivel-sec-${i}">
              <span class="toc-item__icon">${SECTION_ICONS[s.type] ?? ''}</span>
              <span class="toc-item__title">${s.title}</span>
            </a>
          </div>`).join('')}
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

  groups.forEach(group => {
    const label = document.createElement('div');
    label.className = 'sidebar__group-label';
    label.innerHTML = `<span class="sidebar__group-dot sidebar__group-dot--${group.etapa}"></span>${group.label}`;
    list.appendChild(label);

    group.ids.forEach(id => {
      const nivel = getNivel(id);
      if (!nivel) return;
      const item = document.createElement('a');
      item.className = 'sidebar__item' + (id === currentId ? ' active' : '') + (isCompleted(id) ? ' done' : '');
      item.href = `?id=${id}`;
      item.dataset.id = String(id);
      item.innerHTML = `
        <span class="sidebar__item-num">${String(id).padStart(2,'0')}</span>
        <span class="sidebar__item-name">${nivel.title}</span>
        <span class="sidebar__item-check" aria-hidden="true"><i class="ph ph-check"></i></span>`;
      list.appendChild(item);
    });
  });

  // Expone la actualización para el toggle del header
  window.__refreshSidebar = () => {
    renderProgress();
    list.querySelectorAll('.sidebar__item').forEach(item => {
      const id = parseInt(item.dataset.id ?? '-1', 10);
      item.classList.toggle('done', isCompleted(id));
    });
  };
}

// ─── Header ───
function renderHeader(nivel) {
  document.title = `Nivel ${String(nivel.id).padStart(2,'0')} — ${nivel.title} — ContainersPro`;

  // Meta dinámica para compartir (OG / Twitter)
  const og = { title: document.title, description: nivel.objetivo };
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', og.title);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', og.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', og.description);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', og.description);

  document.getElementById('bc-etapa').textContent = nivel.etapaLabel;
  document.getElementById('bc-nivel').textContent = nivel.title;
  document.getElementById('nivel-num').textContent = String(nivel.id).padStart(2,'0');
  document.getElementById('nivel-title').textContent = nivel.title;
  document.getElementById('nivel-objetivo').textContent = nivel.objetivo;

  const badge = document.getElementById('nivel-etapa-badge');
  badge.textContent = nivel.etapa === 'docker' ? 'Docker' : nivel.etapa === 'compose' ? 'Compose' : 'Kubernetes';
  badge.className = `nivel-badge__etapa etapa--${nivel.etapa}`;

  // Chips de resumen del contenido del nivel
  const meta = document.getElementById('nivel-meta');
  if (meta) {
    const labs = nivel.sections.filter(s => s.type === 'lab');
    const codes = nivel.sections.filter(s => s.type === 'code').length;
    meta.innerHTML = `
      <span class="nivel-header__chip"><i class="ph ph-book-open" aria-hidden="true"></i> ${nivel.sections.length} secciones</span>
      <span class="nivel-header__chip"><i class="ph ph-code" aria-hidden="true"></i> ${codes} bloques de código</span>
      <span class="nivel-header__chip"><i class="ph ph-flask" aria-hidden="true"></i> ${labs.length} laboratorio${labs.length === 1 ? '' : 's'}</span>`;
  }
}

// ─── Content renderers ───
function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function renderProse(text) {
  return text.split('\n\n').map(p =>
    `<p class="block-prose">${renderMarkdown(p.trim())}</p>`
  ).join('');
}

/* ─── Resaltado de sintaxis ligero (bash / yaml / dockerfile) ───
   Tokeniza el código crudo y escapa cada pieza: seguro frente a entidades
   HTML dentro de strings y comentarios. */
const SYNTAX_KEYWORDS = {
  bash: new Set(['docker','docker-compose','kubectl','podman','run','build','pull','push','exec','ps','logs','stop','rm','images','compose','up','down','start','restart','inspect','tag','system','prune','volume','network','sudo','apt','dnf','yum','systemctl','git','curl','cd','chmod','echo','cat','mkdir','cp','mv','export','unset','exit','install','update','enable','config']),
  yaml: new Set(['services','image','build','ports','volumes','environment','depends_on','networks','restart','container_name','command','labels','version','driver','external','name','context','dockerfile','args','target','platform','hostname','stdin_open','tty','entrypoint','expose','healthcheck','test','interval','timeout','retries','deploy','replicas','resources','limits','cpus','memory','reservations']),
  dockerfile: new Set(['FROM','RUN','COPY','CMD','ENTRYPOINT','EXPOSE','ENV','WORKDIR','USER','LABEL','ARG','VOLUME','ADD','SHELL','HEALTHCHECK','STOPSIGNAL','ONBUILD','MAINTAINER']),
};

const SYNTAX_RE = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|#[^\n]*|\$\{?[A-Za-z_][A-Za-z0-9_]*\}?|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_-]*\b|[\s\S])/g;

function highlightCode(code, lang = 'bash') {
  const kws = SYNTAX_KEYWORDS[lang] || SYNTAX_KEYWORDS.bash;
  return code.replace(SYNTAX_RE, (m) => {
    if (m.startsWith('"') || m.startsWith("'")) return `<span class="token-string">${escapeHtml(m)}</span>`;
    if (m.startsWith('#')) return `<span class="token-comment">${escapeHtml(m)}</span>`;
    if (m.startsWith('$')) return `<span class="token-var">${escapeHtml(m)}</span>`;
    if (/^\d/.test(m)) return `<span class="token-number">${escapeHtml(m)}</span>`;
    if (kws.has(m.toLowerCase()) || kws.has(m)) return `<span class="token-keyword">${escapeHtml(m)}</span>`;
    return escapeHtml(m);
  });
}

function renderItems(items) {
  return `<ul class="items-list">${items.map(i => `
    <li class="items-list__item">
      <span class="items-list__mark" aria-hidden="true"><i class="ph ph-check"></i></span>
      <span class="items-list__text">${renderMarkdown(i)}</span>
    </li>`).join('')}</ul>`;
}

function renderDiagram(diagram) {
  return `
    <div class="diagram-block">
      <div class="diagram-block__bar">
        <span class="win-dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="diagram-block__label">topología</span>
      </div>
      <pre>${escapeHtml(diagram)}</pre>
    </div>`;
}

function renderCode(code, lang = 'bash') {
  return `
    <div class="code-block">
      <div class="code-block__bar">
        <span class="win-dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="code-block__lang">${lang}</span>
        <button class="code-block__copy" onclick="copyCode(this)">Copiar</button>
      </div>
      <pre>${highlightCode(code, lang)}</pre>
    </div>`;
}

function renderLabSteps(steps) {
  return steps.map((step, i) => `
    <div class="lab-step">
      <span class="lab-step__num">${String(i + 1).padStart(2, '0')}</span>
      <div class="lab-step__body">
        ${step.desc ? `<p class="lab-step__desc">${renderMarkdown(step.desc)}</p>` : ''}
        <div class="lab-step__cmd">
          <pre>${highlightCode(step.cmd)}</pre>
          <button class="lab-step__cmd-copy" onclick="copyCode(this)" aria-label="Copiar comando"><i class="ph ph-copy-simple" aria-hidden="true"></i></button>
        </div>
      </div>
    </div>`).join('');
}

function renderComparison(rows) {
  const header = `<tr><th>Característica</th><th>Sin Docker</th><th>Con Docker</th></tr>`;
  const body = rows.map(r =>
    `<tr><td>${r.feature}</td><td>${r.vm}</td><td>${r.docker}</td></tr>`
  ).join('');
  return `
    <div class="comparison-table-wrap">
      <div class="comparison-table-scroll">
        <table class="comparison-table">
          <thead>${header}</thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    </div>`;
}

function renderHistory(items) {
  return `<ul class="history-list">${items.map(i => `<li>${renderMarkdown(i)}</li>`).join('')}</ul>`;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* Iconos por tipo de sección: compartidos entre el render y el índice */
const SECTION_ICONS = {
  problem: '<i class="ph ph-lightning" aria-hidden="true"></i>',
  analogy: '<i class="ph ph-lightbulb" aria-hidden="true"></i>',
  concepts: '<i class="ph ph-book-open" aria-hidden="true"></i>',
  diagram: '<i class="ph ph-map-trifold" aria-hidden="true"></i>',
  comparison: '<i class="ph ph-scales" aria-hidden="true"></i>',
  history: '<i class="ph ph-calendar-dots" aria-hidden="true"></i>',
  architecture: '<i class="ph ph-buildings" aria-hidden="true"></i>',
  code: '<i class="ph ph-code" aria-hidden="true"></i>',
  lab: '<i class="ph ph-flask" aria-hidden="true"></i>',
};

function renderSection(section, index = 0) {
  const icon = SECTION_ICONS[section.type] ?? '';
  const idx = String(Math.max(index, 1)).padStart(2, '0');

  const head = `
    <div class="section-block__head">
      <span class="section-block__index">${idx}</span>
      <h2 class="section-block__title"><span class="section-block__icon">${icon}</span>${section.title}</h2>
      <span class="section-block__rule" aria-hidden="true"></span>
    </div>`;

  switch (section.type) {
    case 'problem':
    case 'analogy':
      return `
        <aside class="callout callout--${section.type} block--${section.type}">
          <div class="callout__head">
            <span class="callout__icon">${icon}</span>
            <span class="callout__title">${section.title}</span>
            <span class="callout__tag">${section.type === 'problem' ? 'Desafío' : 'Contexto'}</span>
          </div>
          <div class="callout__body">${renderProse(section.body)}</div>
        </aside>`;

    case 'concepts':
    case 'architecture': {
      let inner = '';
      if (section.body) inner += `<div class="body-text">${renderMarkdown(section.body)}</div>`;
      if (section.items) inner += renderItems(section.items);
      if (section.code)  inner += renderCode(section.code, 'yaml');
      return `<div class="section-block">${head}${inner}</div>`;
    }

    case 'diagram': {
      let inner = '';
      if (section.body) inner += `<div class="body-text">${renderMarkdown(section.body)}</div>`;
      inner += renderDiagram(section.diagram);
      return `<div class="section-block">${head}${inner}</div>`;
    }

    case 'comparison':
      return `<div class="section-block">${head}${renderComparison(section.rows)}</div>`;

    case 'history':
      return `<div class="section-block">${head}${renderHistory(section.items)}</div>`;

    case 'code': {
      const lang = section.title?.toLowerCase().includes('yaml') ? 'yaml'
        : section.title?.toLowerCase().includes('dockerfile') ? 'dockerfile'
        : 'bash';
      return `<div class="section-block">${head}${renderCode(section.code, lang)}</div>`;
    }

    case 'lab':
      return `
        <div class="section-block">
          <div class="lab-block">
            <div class="lab-block__header">
              <span class="lab-block__icon"><i class="ph ph-flask" aria-hidden="true"></i></span>
              <span class="lab-block__title">${section.title}</span>
              <span class="lab-block__count">${section.steps.length} pasos</span>
            </div>
            <div class="lab-steps">${renderLabSteps(section.steps)}</div>
          </div>
        </div>`;

    default:
      return '';
  }
}

function renderContent(nivel) {
  const container = document.getElementById('nivel-content');
  // Numeración de secciones solo para los bloques que muestran `head`
  // (los callouts de problema/analogía y el lab no llevan número).
  const numbered = ['concepts', 'architecture', 'diagram', 'comparison', 'history', 'code'];
  let n = 0;
  container.innerHTML = nivel.sections.map((s, i) => {
    const html = renderSection(s, numbered.includes(s.type) ? ++n : 0);
    // Envoltorio con id de ancla (scrollspy) + estructura de escena del modo
    // escenas: .nivel-scene (pantalla completa) > __inner (centrado) > __body.
    // Sin el modo escenas, estos divs son neutrales y el flujo no cambia.
    return `
      <div class="nivel-sec nivel-scene" id="nivel-sec-${i}" data-scene="${i}">
        <div class="nivel-scene__inner">
          <div class="nivel-scene__body">${html}</div>
        </div>
      </div>`;
  }).join('');
}

// ─── Navigation ───
function setupNav(currentId) {
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const prev = getNivel(currentId - 1);
  const next = getNivel(currentId + 1);

  btnPrev.innerHTML = prev
    ? `
      <span class="nivel-nav__dir"><i class="ph ph-arrow-left" aria-hidden="true"></i> Anterior</span>
      <span class="nivel-nav__name">${String(prev.id).padStart(2,'0')} · ${prev.title}</span>`
    : `<span class="nivel-nav__dir">Anterior</span>`;
  btnPrev.disabled = !prev;
  if (prev) btnPrev.addEventListener('click', () => navigate(currentId - 1));

  btnNext.innerHTML = next
    ? `
      <span class="nivel-nav__name">${String(next.id).padStart(2,'0')} · ${next.title}</span>
      <span class="nivel-nav__dir">Siguiente <i class="ph ph-arrow-right" aria-hidden="true"></i></span>`
    : `<span class="nivel-nav__dir">Siguiente</span>`;
  btnNext.disabled = !next;
  if (next) btnNext.addEventListener('click', () => navigate(currentId + 1));
}

// ─── Progreso de secciones leídas del nivel ───
// Refresca el contador y la barra del TOC, los checks de los items y la
// barra superior fija del nivel (nivel-progress). Se llama tras cada toggle.
function renderLevelProgress(nivelId) {
  const toc = document.querySelector('.sidebar__toc');
  if (!toc) return;

  const total = toc.querySelectorAll('.toc-item').length;
  if (!total) return;

  // Una sola lectura del store: read ya trae la lista completa
  const read = getReadSections(nivelId);
  const pct = Math.round((read.length / total) * 100);

  const count = toc.querySelector('.sidebar__toc-progress-count');
  const fill = toc.querySelector('.sidebar__toc-progress-fill');
  if (count) count.textContent = `${read.length} / ${total}`;
  if (fill) fill.style.width = `${pct}%`;

  toc.querySelectorAll('.toc-item').forEach(item => {
    const sec = parseInt(item.dataset.sec, 10);
    const on = read.includes(sec);
    item.classList.toggle('done', on);
    const check = item.querySelector('.toc-item__check');
    if (check) {
      check.setAttribute('aria-pressed', String(on));
      const label = on ? `Sección ${sec + 1} leída` : `Marcar sección ${sec + 1} como leída`;
      check.setAttribute('aria-label', label);
      check.title = label;
    }
  });

  // Barra superior fija del nivel (la misma que anima GSAP en initGSAP)
  const topBar = document.querySelector('.nivel-progress__bar');
  if (topBar) topBar.style.width = `${pct}%`;
}

// ─── Scrollspy: índice de secciones ───
function initSectionSpy(nivelId) {
  const tocList = document.querySelector('.sidebar__toc-list');
  if (!tocList) return;

  const items = [...tocList.querySelectorAll('.toc-item')];
  if (!items.length) return;

  const sections = items
    .map(it => document.getElementById(it.dataset.target))
    .filter(Boolean);
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
  const tops = () => sections.map(sec => sec.getBoundingClientRect().top + window.scrollY);
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
    requestAnimationFrame(() => { update(); ticking = false; });
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

// ─── Feedback del nivel: pulgares + comentario ───
function initFeedback(nivelId) {
  const root = document.getElementById('nivel-feedback');
  if (!root) return;

  const votes = [...root.querySelectorAll('.nivel-feedback__vote')];
  const textarea = document.getElementById('feedback-comment');
  const saveBtn = document.getElementById('feedback-save');

  // El comentario se sincroniza del store solo al iniciar: después, votar
  // nunca pisa lo que el usuario tenga escrito sin guardar.
  if (textarea) textarea.value = getFeedback(nivelId).comment;

  const apply = () => {
    const fb = getFeedback(nivelId);
    votes.forEach(btn => {
      const on = parseInt(btn.dataset.vote, 10) === fb.vote;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  };

  // Pulgares: alternan — volver a tocar el mismo quita el voto
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('.nivel-feedback__vote');
    if (!btn) return;
    const vote = parseInt(btn.dataset.vote, 10);
    const current = getFeedback(nivelId).vote;
    setFeedbackVote(nivelId, current === vote ? 0 : vote);
    apply();
  });

  // Comentario: se guarda explícitamente (evita escribir en cada tecla).
  // El flash de “Guardado” usa un único timeout: si se pulsa dos veces rápido,
  // el segundo clic cancela el anterior y restaura siempre el original.
  const span = saveBtn?.querySelector('span');
  const icon = saveBtn?.querySelector('.ph');
  const ORIGINAL = { label: span?.textContent ?? '', cls: icon?.className ?? '' };
  let flashTimer = null;
  const flashSaved = () => {
    clearTimeout(flashTimer);
    if (span) span.textContent = 'Guardado';
    if (icon) icon.className = 'ph ph-check';
    saveBtn?.classList.add('saved');
    flashTimer = setTimeout(() => {
      if (span) span.textContent = ORIGINAL.label;
      if (icon) icon.className = ORIGINAL.cls;
      saveBtn?.classList.remove('saved');
      flashTimer = null;
    }, 1800);
  };

  saveBtn?.addEventListener('click', () => {
    setFeedbackComment(nivelId, textarea.value);
    flashSaved();
  });

  apply();
}

// ─── Marcar nivel como completado ───
function initCompleteButton(nivel) {
  const btn = document.getElementById('nivel-complete');
  if (!btn) return;
  const label = btn.querySelector('.nivel-complete__label');

  const apply = (animate = false) => {
    const done = isCompleted(nivel.id);
    btn.classList.toggle('done', done);
    btn.setAttribute('aria-pressed', String(done));
    label.textContent = done ? 'Completado' : 'Marcar como completado';
    if (animate && done) {
      btn.classList.remove('celebrate');
      requestAnimationFrame(() => btn.classList.add('celebrate'));
    }
  };

  apply();
  btn.addEventListener('click', () => {
    toggleCompleted(nivel.id);
    apply(true);
    window.__refreshSidebar?.();
  });
}

// ─── Stack 3D (CSS) ───
function buildStack3D(nivel) {
  const el = document.getElementById('nivel-stack');
  if (!el) return;

  const etapa = nivel.etapa === 'compose' ? 'compose' : nivel.etapa === 'k8s' ? 'k8s' : 'docker';
  el.className = `stack3d stack3d--${etapa}`;

  const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
  const units = Array.from({ length: 3 }, () =>
    `<div class="stack3d__unit">${faces.map(f => `<div class="stack3d__face stack3d__face--${f}"></div>`).join('')}</div>`
  ).join('');

  // Partículas que orbitan alrededor de la torre
  const dots = (count, cls) =>
    Array.from({ length: count }, (_, i) => `<span class="stack3d__dot ${cls}" style="--i:${i}"></span>`).join('');

  el.innerHTML = `
    <div class="stack3d__float">
      <div class="stack3d__orbit stack3d__orbit--a" aria-hidden="true">${dots(3, 'stack3d__dot--a')}</div>
      <div class="stack3d__orbit stack3d__orbit--b" aria-hidden="true">${dots(3, 'stack3d__dot--b')}</div>
      <div class="stack3d__stack">${units}</div>
    </div>`;
}

// ─── Modo escenas: zoom por scroll entre módulos (estilo ui8.ai/forge) ───
// Cada módulo (.nivel-scene) es una escena de pantalla completa. Un stage
// fijo (el propio #nivel-content) apila las escenas y el scroll del
// documento las "atraviesa": la activa hace zoom 1→1.45 + fundido mientras
// la siguiente emerge desde atrás (1.45→1). Fiel a Forge:
//   · Snap por módulo: cada gesto (rueda/trackpad/teclado/swipe) navega UN
//     módulo con un glide amortiguado exponencialmente (lag filter). El
//     scroll interno de cada escena es independiente y se respeta hasta
//     llegar a su final; recién ahí el gesto avanza al siguiente módulo.
//   · Inmersivo: nav, sidebar, breadcrumb, barra de progreso y FAB se
//     ocultan durante el escenario (body.scenes-immersed); queda el HUD.
//   · Transición completa: el header se disuelve (zoom de cámara) al entrar
//     al primer módulo y el feedback reaparece al salir del escenario.
//   · Velocidad: la escena activa recibe un "punch" de escala según la
//     velocidad del scroll (resolución de movimiento, like Forge).
//   · Memoria: cada módulo recuerda su scroll interno; al volver retomas
//     donde quedaste.
// Todo se desactiva con prefers-reduced-motion (queda el flujo normal).
const sceneState = { enabled: false, setActive: null, scrollTo: null };

function initSceneZoom(nivel) {
  const wrap = document.getElementById('nivel-scenes');
  const stage = document.getElementById('nivel-content');
  if (!wrap || !stage) return;

  const scenes = [...stage.querySelectorAll('.nivel-sec')];
  const N = scenes.length;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (N < 2 || reduced) return;

  const nav = document.querySelector('.nav');
  const atmosphere = document.querySelector('.atmosphere');
  const header = document.getElementById('nivel-header');
  const counter = document.getElementById('scene-counter');
  const counterNum = document.getElementById('scene-counter-current');
  const counterTotal = document.getElementById('scene-counter-total');
  const counterTitle = document.getElementById('scene-counter-title');
  const counterFill = document.getElementById('scene-counter-fill');

  // Parámetros del efecto (los mismos tonos que la landing de Forge):
  const ZOOM = 0.45;     // escala máxima extra al "atravesar" (1 → 1.45)
  const TRANS = 0.45;    // fracción del segmento dedicada al zoom de paso
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  // Recorrido por módulo: un poco más de una pantalla (el zoom necesita aire).
  const seg = () => window.innerHeight * 1.15;
  // Scroll hasta que el ÚLTIMO módulo se asienta: ahí el snap debe aterrizar
  // con la escena final a escala 1 y opacidad 1.
  const sceneEnd = () => (N - 1) * seg();
  // Pista de salida: EXIT_FADE extra de scroll tras el último módulo para
  // disolver el stage hacia el feedback (el snap no puede caer en este tramo).
  const totalScroll = () => sceneEnd() + EXIT_FADE;
  const ENTER_FADE = window.innerHeight * 0.5;  // fundido del stage al entrar
  const EXIT_FADE = window.innerHeight * 0.35;  // fundido al salir (llega el feedback)

  document.body.classList.add('scenes-mode');
  sceneState.enabled = true;

  const updateWrapHeight = () => {
    // El wrapper reserva 100vh + recorrido: el stage (fijo) tiene scroll de sobra.
    wrap.style.height = `${window.innerHeight + totalScroll()}px`;
  };
  updateWrapHeight();
  window.addEventListener('resize', updateWrapHeight);

  // ─── Snap por módulo: glide amortiguado exponencialmente (lag filter) ───
  // Forge convierte el scroll en un valor virtual y lo amortigua con
  // `current += (target - current) * (1 - exp(-dt/τ))`. Aquí el "target" es
  // la posición Y del módulo destino y un rAF mueve window.scrollY con esa
  // curva: el documento se desliza y se asienta con peso (sin easing JS
  // rígido, es la misma física exponencial de ui8.ai/forge).
  const GLIDE_TAU = 240;   // constante de tiempo del lag filter (ms)
  const GLIDE_LOCK = 650;  // ventana de bloqueo tras disparar un glide
  const WHEEL_STEP = 64;   // delta acumulado (px) para considerar un gesto
  const SWIPE_STEP = 44;   // distancia táctil (px) para navegar

  let activeIndex = 0;      // módulo visible (redondeo del progreso)
  const sceneScrolls = new Map(); // scroll interno por módulo (para volver)

  // ── Glide interrumpible: el "target" vive en una variable y el rAF lo
  // persigue con la curva exponencial. Si llega otro gesto antes de asentarse
  // (misma dirección o reversa), solo cambia el target y el loop redirige.
  let glideTarget = null;   // Y absoluta objetivo (null = glide inactivo)
  let glideY = 0;           // valor amortiguado actual
  let glideRaf = null;
  let glideLast = 0;
  let glideLockUntil = 0;

  const moduleY = (k) => {
    const start = wrap.getBoundingClientRect().top + window.scrollY;
    const idx = clamp(k, 0, N - 1);
    // El módulo 0 se muestra recién pasado el fundido de entrada.
    const entryOffset = idx === 0 ? ENTER_FADE * 0.8 : 0;
    // Los módulos se distribuyen sobre sceneEnd (el snap del último aterriza
    // con la escena totalmente visible, antes de la pista de salida).
    return start + (idx / (N - 1)) * sceneEnd() + entryOffset;
  };

  const glideStep = (now) => {
    if (glideTarget === null) { glideRaf = null; return; }
    const dt = Math.min(64, now - (glideLast || now));
    glideLast = now;
    glideY += (glideTarget - glideY) * (1 - Math.exp(-dt / GLIDE_TAU));
    window.scrollTo(0, glideY);
    if (Math.abs(glideTarget - glideY) < 0.5) {
      glideTarget = null;
      glideRaf = null;
      window.scrollTo(0, glideY);
    } else {
      glideRaf = requestAnimationFrame(glideStep);
    }
  };

  const goToModule = (k) => {
    const idx = clamp(k, 0, N - 1);
    glideLockUntil = performance.now() + GLIDE_LOCK;
    // Guarda el scroll interno del módulo que dejamos y restaura el destino.
    const from = scenes[activeIndex];
    if (from) sceneScrolls.set(activeIndex, from.scrollTop);
    const to = scenes[idx];
    if (to) to.scrollTop = sceneScrolls.get(idx) ?? 0;

    glideTarget = moduleY(idx);
    if (!glideRaf) {
      glideY = window.scrollY;
      glideLast = 0;
      glideRaf = requestAnimationFrame(glideStep);
    }
  };

  const stopGlide = () => {
    glideTarget = null;
    if (glideRaf) { cancelAnimationFrame(glideRaf); glideRaf = null; }
  };

  // ─── Inmersivo: oculta el chrome mientras el escenario está activo ───
  let immersed = false;
  const setImmersed = (on) => {
    if (on === immersed) return;
    immersed = on;
    document.body.classList.toggle('scenes-immersed', on);
    if (nav) gsap.to(nav, { yPercent: on ? -100 : 0, duration: 0.45, ease: 'power3.inOut', overwrite: 'auto' });
  };

  // ¿La escena activa puede scrollear internamente en esa dirección?
  const canSceneScroll = (scene, dir) => {
    if (!scene) return false;
    if (dir > 0) return scene.scrollTop < scene.scrollHeight - scene.clientHeight - 1;
    return scene.scrollTop > 1;
  };

  // El stage recién se intercepta después del fundido de entrada: antes, el
  // scroll nativo deja "caer" al usuario al primer módulo (dive de entrada).
  const wrapTopDoc = () => wrap.getBoundingClientRect().top + window.scrollY;
  const enteredStage = () => window.scrollY > wrapTopDoc() + ENTER_FADE * 0.4;

  // ─── Rueda / trackpad: scroll interno primero; al llegar al final, snap ───
  let wheelAcc = 0, wheelDir = 0;
  const onWheel = (e) => {
    if (!sceneState.enabled || !immersed || !enteredStage()) return;
    const dir = e.deltaY > 0 ? 1 : -1;
    if (canSceneScroll(scenes[activeIndex], dir)) return; // deja el scroll interno
    // En los bordes del escenario, el gesto hacia afuera sale (scroll nativo).
    if ((activeIndex === 0 && dir < 0) || (activeIndex === N - 1 && dir > 0)) return;
    e.preventDefault();
    // Durante un glide, el scroll nativo pelearía con el tween: se bloquea.
    if (performance.now() < glideLockUntil) return;
    if (dir !== wheelDir) { wheelDir = dir; wheelAcc = 0; }
    wheelAcc += Math.min(160, Math.abs(e.deltaY));
    if (wheelAcc >= WHEEL_STEP) { wheelAcc = 0; goToModule(activeIndex + dir); }
  };
  window.addEventListener('wheel', onWheel, { passive: false });

  // ─── Swipe táctil (misma lógica: contenido interno → luego módulo) ───
  let touchY = null;
  const onTouchStart = (e) => { if (e.touches.length === 1) touchY = e.touches[0].clientY; };
  const onTouchMove = (e) => {
    if (!sceneState.enabled || !immersed || !enteredStage() || touchY === null || e.touches.length !== 1) return;
    const dy = e.touches[0].clientY - touchY;
    const dir = dy > 0 ? -1 : 1;
    if (canSceneScroll(scenes[activeIndex], dir)) { touchY = e.touches[0].clientY; return; }
    if ((activeIndex === 0 && dir < 0) || (activeIndex === N - 1 && dir > 0)) return;
    // Durante un glide, bloquear el scroll nativo (pelearía con el tween).
    if (performance.now() < glideLockUntil) { e.preventDefault(); return; }
    if (Math.abs(dy) < SWIPE_STEP) return;
    e.preventDefault();
    touchY = e.touches[0].clientY;
    goToModule(activeIndex + dir);
  };
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', () => { touchY = null; }, { passive: true });

  // ─── Teclado: flechas / espacio / PageUp-Down / Home-End ───
  const onKey = (e) => {
    if (!sceneState.enabled || !immersed) return;
    const t = e.target;
    if (t && t.closest('input, textarea, select, [contenteditable]')) return;
    const map = { ArrowDown: 1, ArrowRight: 1, PageDown: 1, ' ': 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1, Home: -Infinity, End: Infinity };
    const dir = map[e.key];
    if (dir === undefined || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    if (dir === -Infinity) { goToModule(0); return; }
    if (dir === Infinity) { goToModule(N - 1); return; }
    const scene = scenes[activeIndex];
    if (scene && canSceneScroll(scene, dir)) {
      scene.scrollBy({ top: dir * scene.clientHeight * 0.85, behavior: 'smooth' });
    } else {
      goToModule(activeIndex + dir);
    }
  };
  window.addEventListener('keydown', onKey);

  // Revelado escalonado del contenido de un módulo al entrar en escena.
  const playEntrance = (idx) => {
    const scene = scenes[idx];
    if (!scene) return;
    const body = scene.querySelector('.nivel-scene__body');
    if (!body) return;
    gsap.fromTo(body.children, { y: 26, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.65, stagger: 0.07, ease: 'power3.out', overwrite: 'auto',
    });
    body.querySelectorAll('.items-list__item, .lab-step, .history-list li, .comparison-table tbody tr').forEach((el, i) => {
      gsap.fromTo(el, { y: 14, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.5, delay: i * 0.04, ease: 'power2.out', overwrite: 'auto',
      });
    });
  };

  // HUD: número de módulo actual, título y barra de avance.
  let lastDisplay = -1;
  const updateHud = (sf) => {
    if (!counter) return;
    const display = clamp(Math.round(sf) + 1, 1, N);
    if (display !== lastDisplay) {
      lastDisplay = display;
      if (counterNum) counterNum.textContent = String(display).padStart(2, '0');
      if (counterTitle) counterTitle.textContent = nivel.sections[display - 1]?.title ?? '';
    }
    if (counterFill) counterFill.style.width = `${(clamp(sf) / (N - 1)) * 100}%`;
  };

  // Transición de las escenas según la posición flotante en [0, N-1].
  // `vel` (px/s) añade un "punch" de escala como la resolución de movimiento
  // de Forge: a más velocidad de scroll, más "respira" la escena activa.
  let lastK = -1;
  const updateScenes = (sf, vel = 0) => {
    const s = clamp(sf, 0, N - 1 - 1e-4);
    const k = Math.floor(s);
    const local = s - k;
    const t = clamp((local - (1 - TRANS)) / TRANS);
    const punch = clamp(Math.abs(vel) / 5000, 0, 0.035);

    scenes.forEach((scene, i) => {
      if (i === k) {
        // Escena activa: se "atraviesa" — zoom hacia adentro y fundido.
        gsap.set(scene, {
          scale: 1 + t * ZOOM + punch, opacity: 1 - t * 0.85, zIndex: 10, transformOrigin: '50% 50%',
        });
      } else if (i === k + 1) {
        // Siguiente escena: emerge desde atrás y se asienta en escala 1.
        gsap.set(scene, {
          scale: 1 + ZOOM - t * ZOOM - punch, opacity: 0.15 + t * 0.85, zIndex: 5, transformOrigin: '50% 50%',
        });
      } else {
        gsap.set(scene, { scale: 1, opacity: 0, zIndex: 0 });
      }
    });

    // Al empezar una nueva transición, la escena entrante revela su contenido
    // y guardamos el scroll interno de la que dejamos (memoria por módulo).
    if (k !== lastK) {
      if (lastK >= 0) sceneScrolls.set(lastK, scenes[lastK]?.scrollTop ?? 0);
      lastK = k;
      playEntrance(k + 1);
    }
  };

  // Fundidos de entrada/salida del stage (el escenario aparece sobre el
  // header y se disuelve cuando llega la sección de feedback).
  const fadeInOut = (el) => {
    if (!el) return;
    gsap.fromTo(el, { opacity: 0 }, {
      opacity: 1, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top top', end: `+=${ENTER_FADE}`, scrub: true },
    });
    gsap.fromTo(el, { opacity: 1 }, {
      opacity: 0, ease: 'none',
      scrollTrigger: {
        trigger: wrap,
        start: () => `top top+=${Math.max(totalScroll() - EXIT_FADE, 1)}`,
        end: 'bottom bottom', scrub: true,
      },
    });
  };
  fadeInOut(stage);
  fadeInOut(counter);

  // ScrollTrigger principal: el recorrido de escenas termina en sceneEnd;
  // la pista de salida (totalScroll − sceneEnd) queda para el fundido final.
  const st = ScrollTrigger.create({
    trigger: wrap,
    start: 'top top',
    end: () => `+=${sceneEnd()}`,
    scrub: 1,
    anticipatePin: 1,
    onUpdate: (self) => {
      const sf = self.progress * (N - 1);
      activeIndex = clamp(Math.round(sf), 0, N - 1);
      updateScenes(sf, self.getVelocity());
      updateHud(sf);
      sceneState.setActive?.(activeIndex);
    },
    onEnter: () => setImmersed(true),
    onEnterBack: () => setImmersed(true),
    onLeave: () => setImmersed(false),
    onLeaveBack: () => {
      setImmersed(false);
      sceneState.setActive?.(-1);
    },
    onRefresh: updateWrapHeight,
  });

  // Cámara que entra: el header se aleja (zoom) mientras el stage lo cubre,
  // como el "dive" de Forge. Solo escala: la opacidad del stage hace el fade.
  if (header) {
    gsap.fromTo(header, { scale: 1 }, {
      scale: 1.15, ease: 'none', transformOrigin: '50% 45%',
      scrollTrigger: { trigger: wrap, start: 'top top', end: `+=${ENTER_FADE}`, scrub: true },
    });
  }

  // Profundidad: la atmósfera se escala suavemente durante el escenario.
  if (atmosphere) {
    gsap.fromTo(atmosphere, { scale: 1 }, {
      scale: 1.16, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top top', end: () => `+=${totalScroll()}`, scrub: 1 },
    });
  }

  // Clicks del índice de secciones: glide amortiguado hasta el módulo.
  sceneState.scrollTo = (i) => goToModule(i);

  // Estado inicial: primera escena visible y revelada.
  if (counterTotal) counterTotal.textContent = String(N).padStart(2, '0');
  if (counterNum) counterNum.textContent = '01';
  if (counterTitle) counterTitle.textContent = nivel.sections[0]?.title ?? '';
  lastDisplay = 1;
  lastK = 0;
  activeIndex = 0;
  updateScenes(0, 0);
  playEntrance(0);

  requestAnimationFrame(() => ScrollTrigger.refresh());
}

// ─── GSAP + ScrollTrigger ───
function initGSAP() {
  const mm = gsap.matchMedia();
  const scope = document.getElementById('nivel-main') || document.body;
  const layout = document.querySelector('.nivel-layout');
  const sidebar = document.getElementById('sidebar');
  const bar = document.querySelector('.nivel-progress__bar');

  // Animaciones de contenido (sin pin)
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const ctx = gsap.context(() => {
      const header = document.getElementById('nivel-header');
      if (header) {
        gsap.fromTo(header, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' });
      }

      // Entrada escalonada del badge, título y objetivo (como el hero del landing)
      gsap.fromTo('.nivel-badge, .nivel-header__title, .nivel-header__objetivo', {
        y: 22, opacity: 0,
      }, {
        y: 0, opacity: 1, duration: 0.75, stagger: 0.1, delay: 0.2, ease: 'power3.out', overwrite: 'auto',
      });

      const stack = document.querySelector('.stack3d');
      if (stack) {
        gsap.fromTo(stack, { opacity: 0, y: 18, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, delay: 0.4, ease: 'power3.out' });
      }

      // En modo escenas los módulos se revelan dentro de cada escena
      // (initSceneZoom); estos reveals por scroll no aplican (las secciones
      // viven en el stage fijo y sus posiciones no cambian con el scroll).
      if (!document.body.classList.contains('scenes-mode')) {
        gsap.utils.toArray('.section-block, .block--problem, .block--analogy').forEach((el) => {
          gsap.fromTo(el, { y: 30, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          });
        });

        document.querySelectorAll('.items-list').forEach((list) => {
          gsap.fromTo(list.children, { y: 14, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.05,
            scrollTrigger: { trigger: list, start: 'top 87%' },
          });
        });

        document.querySelectorAll('.lab-steps').forEach((steps) => {
          gsap.fromTo(steps.children, { y: 16, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.06,
            scrollTrigger: { trigger: steps, start: 'top 87%' },
          });
        });

        document.querySelectorAll('.history-list').forEach((list) => {
          gsap.fromTo(list.children, { y: 12, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', stagger: 0.04,
            scrollTrigger: { trigger: list, start: 'top 87%' },
          });
        });

        document.querySelectorAll('.comparison-table').forEach((table) => {
          gsap.fromTo(table.querySelectorAll('tbody tr'), { opacity: 0, x: -10 }, {
            opacity: 1, x: 0, duration: 0.45, stagger: 0.04,
            scrollTrigger: { trigger: table.closest('.section-block'), start: 'top 85%' },
          });
        });
      }

      if (bar) {
        gsap.fromTo(bar, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 1.1, ease: 'power3.out', delay: 0.5 });
      }
    }, scope);
    return () => ctx.revert();
  });

  // Pin del sidebar en tablet y desktop (≥768px)
  if (sidebar && layout) {
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: layout,
          start: 'top top',
          end: 'bottom bottom',
          pin: sidebar,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
      }, layout);
      return () => ctx.revert();
    });
  }

  requestAnimationFrame(() => ScrollTrigger.refresh());
}

// ─── Progress bar ───
function setupProgress(currentId) {
  const bar = document.createElement('div');
  bar.className = 'nivel-progress';
  const inner = document.createElement('div');
  inner.className = 'nivel-progress__bar';
  // El ancho lo fija renderLevelProgress (se llama en el boot y tras cada
  // toggle de sección): aquí solo se crea la estructura.
  inner.style.width = '0%';
  bar.appendChild(inner);
  document.body.insertBefore(bar, document.body.firstChild);
}

// ─── Copy code ───
window.copyCode = function(btn) {
  const pre = btn.closest('.code-block, .lab-step__cmd')?.querySelector('pre');
  if (!pre) return;
  navigator.clipboard.writeText(pre.textContent).then(() => {
    const original = btn.innerHTML;
    const originalLabel = btn.getAttribute('aria-label');
    btn.innerHTML = '<i class="ph ph-check" aria-hidden="true"></i> Copiado';
    btn.setAttribute('aria-label', 'Copiado');
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = original;
      if (originalLabel) btn.setAttribute('aria-label', originalLabel);
      else btn.removeAttribute('aria-label');
      btn.classList.remove('copied');
    }, 2000);
  });
};

// ─── Sidebar mobile ───
function setupSidebarMobile() {
  const sidebar = document.getElementById('sidebar');
  const openBtn = document.getElementById('sidebar-open-btn');
  const closeBtn = document.getElementById('sidebar-toggle');

  openBtn?.addEventListener('click', () => sidebar.classList.add('open'));
  closeBtn?.addEventListener('click', () => sidebar.classList.remove('open'));

  sidebar.addEventListener('click', e => {
    if (e.target.closest('.sidebar__item')) {
      sidebar.classList.remove('open');
    }
  });
}

// ─── Boot ───
document.addEventListener('DOMContentLoaded', () => {
  initTheme(document.getElementById('theme-toggle'));
  const id = getCurrentId();
  const nivel = getNivel(id);

  if (!nivel) {
    document.getElementById('nivel-content').innerHTML = '<p style="color:red">Nivel no encontrado.</p>';
    return;
  }

  buildSidebar(id, nivel);
  renderHeader(nivel);
  buildStack3D(nivel);
  renderContent(nivel);
  // Modo escenas: convierte los módulos en escenas full-screen con zoom por
  // scroll (debe correr antes del scrollspy, que lo usa para sus clics).
  initSceneZoom(nivel);
  initSectionSpy(id);
  initAtmosphere();
  setupNav(id);
  setupProgress(id);
  renderLevelProgress(id);
  setupSidebarMobile();
  initCompleteButton(nivel);
  initFeedback(id);
  initGSAP();

  // Registra el nivel como último visitado para el landing
  setLastVisited(id);
});
