import { niveles } from './data/niveles.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initTickerLogos, brandMarkup, TOOL_ICON_MAP } from './ticker-logos.js';
import { initAtmosphere } from './atmosphere.js';
import { initTheme } from './theme.js';
import { isCompleted, toggleCompleted, completedCount, getLastVisited, getFeedback, feedbackStats } from './progress.js';

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

// ─── Etapa tabs ───
function initEtapaTabs() {
  const tabs = document.querySelectorAll('.etapa-tab');
  const contents = document.querySelectorAll('.etapa-content');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.etapa;
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const content = document.querySelector(`.etapa-content[data-content="${target}"]`);
      content?.classList.add('active');

      // Micro-animación de los chips al cambiar de etapa
      if (!reduced && content) {
        const chips = content.querySelectorAll('.level-chip');
        gsap.fromTo(chips, { y: 12, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.45, stagger: 0.04, ease: 'power2.out', overwrite: 'auto',
        });
      }
    });
  });
}

// ─── Build nivel cards dinámicamente ───
function buildNivelCards() {
  const grid = document.getElementById('niveles-grid');
  if (!grid) return;
  grid.innerHTML = '';

  niveles.forEach(nivel => {
    // Extract summary bullets from sections
    const bullets = [];
    nivel.sections.forEach(s => {
      if (s.items) bullets.push(...s.items.slice(0, 2));
      if (bullets.length >= 4) return;
    });

    const haLab = nivel.sections.some(s => s.type === 'lab');
    const labSection = nivel.sections.find(s => s.type === 'lab');
    const isFinal = nivel.id === niveles.length - 1;

    const etapaLabel = nivel.etapa === 'docker' ? 'Docker'
      : nivel.etapa === 'compose' ? 'Compose'
      : 'Kubernetes';

    const done = isCompleted(nivel.id);
    const fb = getFeedback(nivel.id);
    const card = document.createElement('div');
    card.className = `nivel-card${isFinal ? ' nivel-card--final' : ''}${done ? ' done' : ''}`;
    card.dataset.nivel = nivel.id;

    card.innerHTML = `
      <div class="nivel-card__header">
        <span class="nivel-card__num">${String(nivel.id).padStart(2,'0')}</span>
        <div>
          <h3 class="nivel-card__title">${nivel.title}</h3>
          <span class="nivel-card__etapa etapa--${nivel.etapa}">${etapaLabel}</span>
        </div>
        ${fb.vote !== 0 ? `
        <span class="nivel-card__fb nivel-card__fb--${fb.vote === 1 ? 'up' : 'down'}" role="img" title="${fb.vote === 1 ? 'Te gustó este nivel' : 'Marcaste este nivel para mejorar'}" aria-label="${fb.vote === 1 ? 'Te gustó este nivel' : 'Marcaste este nivel para mejorar'}">
          <i class="ph ${fb.vote === 1 ? 'ph-thumbs-up' : 'ph-thumbs-down'}" aria-hidden="true"></i>
        </span>` : ''}
        <button class="nivel-card__check${done ? ' done' : ''}" data-id="${nivel.id}" aria-pressed="${done}" aria-label="${done ? 'Marcar como pendiente' : 'Marcar como completado'}" title="${done ? 'Marcar como pendiente' : 'Marcar como completado'}">
          <i class="ph ph-check" aria-hidden="true"></i>
        </button>
        <span class="nivel-card__toggle">+</span>
      </div>
      <div class="nivel-card__body">
        <ul>
          ${bullets.slice(0,4).map(b => `<li>${b.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>')}</li>`).join('')}
        </ul>
        ${haLab ? `<div class="nivel-card__lab"><i class="ph ph-flask" aria-hidden="true"></i> ${labSection?.title ?? 'Laboratorio'}</div>` : ''}
        <a class="nivel-card__link" href="nivel.html?id=${nivel.id}">
          Ver nivel completo <i class="ph ph-arrow-right" aria-hidden="true"></i>
        </a>
      </div>`;

    grid.appendChild(card);
  });

  initNivelCards();
}

// ─── Nivel cards accordion ───
function initNivelCards() {
  document.querySelectorAll('.nivel-card__header').forEach(header => {
    header.addEventListener('click', (e) => {
      // El check de completado no debe abrir el acordeón
      if (e.target.closest('.nivel-card__check')) return;
      const card = header.closest('.nivel-card');
      const isOpen = card.classList.contains('open');
      document.querySelectorAll('.nivel-card').forEach(c => c.classList.remove('open'));
      if (!isOpen) card.classList.add('open');
    });
  });
}

// ─── Progreso: marcar/desmarcar nivel desde la grid ───
function initProgressGrid() {
  const grid = document.getElementById('niveles-grid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const check = e.target.closest('.nivel-card__check');
    if (!check) return;
    e.stopPropagation();
    const id = parseInt(check.dataset.id, 10);
    const done = toggleCompleted(id);
    const card = check.closest('.nivel-card');
    card.classList.toggle('done', done);
    check.classList.toggle('done', done);
    check.setAttribute('aria-pressed', String(done));
    check.title = done ? 'Marcar como pendiente' : 'Marcar como completado';
    updateProgressSummary();
  });
}

// ─── Resumen de progreso arriba de la grid ───
function updateProgressSummary() {
  const el = document.querySelector('.niveles__progress');
  if (!el) return;
  const total = niveles.length;
  const done = completedCount();
  const pct = total ? Math.round((done / total) * 100) : 0;
  const { up, down, comments } = feedbackStats();
  const fbLine = (up + down + comments) > 0
    ? `
      <div class="niveles__progress-feedback">
        ${up > 0 ? `<span class="niveles__progress-fb niveles__progress-fb--up"><i class="ph ph-thumbs-up" aria-hidden="true"></i> ${up}</span>` : ''}
        ${down > 0 ? `<span class="niveles__progress-fb niveles__progress-fb--down"><i class="ph ph-thumbs-down" aria-hidden="true"></i> ${down}</span>` : ''}
        ${comments > 0 ? `<span class="niveles__progress-fb niveles__progress-fb--comments"><i class="ph ph-chats-circle" aria-hidden="true"></i> ${comments} comentario${comments === 1 ? '' : 's'}</span>` : ''}
      </div>`
    : '';
  el.innerHTML = `
    <div class="niveles__progress-head">
      <span class="niveles__progress-label">
        <i class="ph ph-check-circle" aria-hidden="true"></i>
        Progreso del curso
      </span>
      <span class="niveles__progress-count">${done} / ${total} niveles</span>
    </div>
    <div class="niveles__progress-track">
      <div class="niveles__progress-fill" style="width:${pct}%"></div>
    </div>
    ${fbLine}`;
}

// ─── Continuar donde quedaste (último nivel visitado) ───
function initContinueCta() {
  const last = getLastVisited();
  const cta = document.getElementById('continue-cta');
  if (!cta) return;
  if (last === null) { cta.remove(); return; }
  const nivel = niveles[last];
  if (!nivel) { cta.remove(); return; }
  cta.href = `nivel.html?id=${last}`;
  cta.querySelector('.continue-cta__label').textContent = nivel.title;
  cta.querySelector('.continue-cta__num').textContent = String(last).padStart(2, '0');
}

// ─── Logos oficiales en los tool-tags ───
function initToolLogos() {
  document.querySelectorAll('.tool-tag').forEach(tag => {
    const key = TOOL_ICON_MAP[tag.textContent.trim().toLowerCase()];
    if (!key) return;
    const svg = brandMarkup(key);
    if (svg) tag.insertAdjacentHTML('afterbegin', svg);
  });
}

// ─── Nav active state ───
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav__links a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        document.querySelector(`.nav__links a[href="#${entry.target.id}"]`)?.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => observer.observe(s));
}

// ─── Buttons ───
function initButtons() {
  document.getElementById('hero-preview')?.addEventListener('click', () => {
    document.getElementById('niveles')?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ─── GSAP + ScrollTrigger: motion del landing ───
function initLandingMotion() {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const ctx = gsap.context(() => {

      // Entrada del hero (stagger) — solo si estamos arriba del todo
      if (window.scrollY === 0) {
        gsap.fromTo('.hero__badge, .hero__title, .hero__sub, .hero__actions, .hero__ticker', {
          y: 34, opacity: 0,
        }, {
          y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: 0.11, delay: 0.2,
        });
      }

      // Títulos y subtítulos de sección
      gsap.utils.toArray('.section-title, .section-sub').forEach((el) => {
        gsap.fromTo(el, { y: 24, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });

      // Objetivos
      const objGrid = document.querySelector('.objectives__grid');
      if (objGrid) {
        gsap.fromTo(objGrid.children, { y: 20, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out',
          scrollTrigger: { trigger: objGrid, start: 'top 85%' },
        });
      }

      // Metodología: ilustración + pasos + conectores
      const methodFig = document.querySelector('.method__figure');
      if (methodFig) {
        gsap.fromTo(methodFig, { y: 26, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: methodFig, start: 'top 88%' },
        });
      }
      const methodSteps = document.querySelectorAll('.method__step');
      if (methodSteps.length) {
        gsap.fromTo(methodSteps, { y: 22, opacity: 0, scale: 0.95 }, {
          y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.09, ease: 'power2.out',
          scrollTrigger: { trigger: '.method__steps', start: 'top 85%' },
        });
      }

      // Etapas: tabs + chips activos
      gsap.fromTo('.etapa-tab', { y: 16, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power2.out',
        scrollTrigger: { trigger: '.etapa-tabs', start: 'top 87%' },
      });
      const activeChips = document.querySelectorAll('.etapa-content.active .level-chip');
      if (activeChips.length) {
        gsap.fromTo(activeChips, { y: 12, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.45, stagger: 0.045, ease: 'power2.out',
          scrollTrigger: { trigger: '.etapa-content.active', start: 'top 87%' },
        });
      }

      // Tarjetas de nivel
      const cards = document.querySelectorAll('.nivel-card');
      if (cards.length) {
        gsap.fromTo(cards, { y: 24, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.55, stagger: 0.05, ease: 'power2.out',
          scrollTrigger: { trigger: '.niveles__grid', start: 'top 85%' },
        });
      }

      // Proyecto: banner + arquitectura + capas
      const proyBanner = document.querySelector('.proyecto__banner');
      if (proyBanner) {
        gsap.fromTo(proyBanner, { y: 26, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: proyBanner, start: 'top 88%' },
        });
      }
      const archBoxes = document.querySelectorAll('.proyecto__arch .arch-box, .proyecto__arch .arch-row');
      if (archBoxes.length) {
        gsap.fromTo(archBoxes, { y: 18, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: '.proyecto__arch', start: 'top 85%' },
        });
      }
      const proyLayers = document.querySelectorAll('.proyecto__layer');
      if (proyLayers.length) {
        gsap.fromTo(proyLayers, { y: 24, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.55, stagger: 0.09, ease: 'power2.out',
          scrollTrigger: { trigger: '.proyecto__layers', start: 'top 88%' },
        });
      }

      // Herramientas
      const toolGroups = document.querySelectorAll('.tool-group');
      if (toolGroups.length) {
        gsap.fromTo(toolGroups, { y: 24, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: 'power2.out',
          scrollTrigger: { trigger: '.tools__grid', start: 'top 85%' },
        });
      }

      // Ruta de aprendizaje (cascada)
      const rutaItems = document.querySelectorAll('.ruta__item');
      const rutaConn = document.querySelectorAll('.ruta__connector');
      if (rutaItems.length) {
        gsap.fromTo(rutaItems, { x: -20, opacity: 0 }, {
          x: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out',
          scrollTrigger: { trigger: '.ruta__path', start: 'top 85%' },
        });
        gsap.fromTo(rutaConn, { scaleY: 0 }, {
          scaleY: 1, transformOrigin: 'top center', duration: 0.3, stagger: 0.06, ease: 'power2.out',
          scrollTrigger: { trigger: '.ruta__path', start: 'top 85%' },
        });
      }

      // CTA final
      const cta = document.querySelector('.cta-final .container');
      if (cta) {
        gsap.fromTo(cta.children, { y: 24, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.cta-final', start: 'top 85%' },
        });
      }

    });
    return () => ctx.revert();
  });

  // Conectores de la metodología: horizontales en desktop, verticales en móvil
  mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
    const conn = document.querySelectorAll('.method__connector');
    if (!conn.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(conn, { scaleX: 0 }, {
        scaleX: 1, duration: 0.4, stagger: 0.09, ease: 'power2.out',
        scrollTrigger: { trigger: '.method__steps', start: 'top 85%' },
      });
    });
    return () => ctx.revert();
  });

  mm.add('(max-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    const conn = document.querySelectorAll('.method__connector');
    if (!conn.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(conn, { scaleY: 0, transformOrigin: 'top center' }, {
        scaleY: 1, duration: 0.35, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: '.method__steps', start: 'top 85%' },
      });
    });
    return () => ctx.revert();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme(document.getElementById('theme-toggle'));
  initEtapaTabs();
  initTickerLogos();
  initToolLogos();
  buildNivelCards();
  updateProgressSummary();
  initProgressGrid();
  initContinueCta();
  initAtmosphere();
  initNavHighlight();
  initButtons();
  initLandingMotion();

  // Vórtice WebGL (hero-18) se carga bajo demanda para no inflar el bundle inicial
  let vortexApi = null;
  import('./hero-vortex.js').then(({ initHeroVortex }) => {
    vortexApi = initHeroVortex(document.getElementById('hero-vortex'));
  }).catch(() => {});

  // Cambio de tema (toggle o desde otra pestaña): el vórtice reconfigura su
  // paleta (blend aditivo oscuro ↔ normal claro) sin recargar la página.
  document.addEventListener('theme:change', (e) => {
    vortexApi?.setTheme?.(e.detail?.theme);
  });

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
});
