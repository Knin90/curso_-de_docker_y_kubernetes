// ─── Orquestador del carousel horizontal cinematográfico de niveles ───
// Arma el DOM interno de `#course-exp`, conecta background/cards/title/
// metrics/pagination/navigation/animation-controller y sincroniza progreso
// real vía ../../progress.js (fuente de verdad única). Reemplaza el modo
// escenas anterior (main/landing-scenes.js).
import { niveles } from '../../data/niveles.js';
import { isCompleted, toggleCompleted, setLastVisited, getLastVisited } from '../../progress.js';
import { courseState, setActiveIndex, totalLevels } from './state.js';
import { createBackground } from './background.js';
import { createCardSlots, refreshCardCompletion } from './cards.js';
import { createTitle } from './title.js';
import { createMetrics } from './metrics.js';
import { createPagination } from './pagination.js';
import { createAnimationController } from './animation-controller.js';
import { initNavigation } from './navigation.js';

export function initCourseExperience() {
  const root = document.getElementById('course-exp');
  if (!root) return null;

  const bgRoot = document.getElementById('course-exp-bg');
  const decor = document.getElementById('course-exp-visual');
  const cardsContainer = document.getElementById('course-exp-cards');
  const titleEl = document.getElementById('course-exp-title');
  const metricsEl = document.getElementById('course-exp-metrics');
  const pagEl = document.getElementById('course-exp-pagination');
  const progressEl = document.getElementById('course-exp-progress');
  const menuBtn = document.getElementById('course-exp-menu-btn');
  const menuPanel = document.getElementById('course-exp-menu');
  if (!bgRoot || !cardsContainer || !titleEl || !metricsEl || !pagEl) return null;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Arranca en el último nivel visitado si existe, si no en el nivel 0.
  const start = getLastVisited();
  setActiveIndex(Number.isInteger(start) ? start : 0);

  const background = createBackground(bgRoot, decor);
  const title = createTitle(titleEl);
  const metrics = createMetrics(metricsEl);
  const pagination = createPagination(pagEl, totalLevels());

  function openActiveLevel() {
    const nivel = niveles[courseState.activeIndex];
    controller.openActive(() => {
      setLastVisited(nivel.id);
      window.location.href = `nivel.html?id=${nivel.id}`;
    });
  }

  const cards = createCardSlots(cardsContainer, openActiveLevel);
  const controller = createAnimationController({ container: cardsContainer, cards });

  function renderProgressPanel(nivel) {
    if (!progressEl) return;
    const done = isCompleted(nivel.id);
    progressEl.innerHTML = `
      <button type="button" class="course-exp-progress__btn${done ? ' done' : ''}"
        id="course-exp-progress-btn" data-id="${nivel.id}" aria-pressed="${done}">
        <i class="ph ${done ? 'ph-check-circle' : 'ph-circle'}" aria-hidden="true"></i>
        ${done ? 'Nivel completado' : 'Marcar como completado'}
      </button>`;
    progressEl.querySelector('#course-exp-progress-btn')?.addEventListener('click', () => {
      const id = nivel.id;
      const nowDone = toggleCompleted(id);
      document.dispatchEvent(new CustomEvent('course-progress:change', { detail: { id, done: nowDone } }));
      renderProgressPanel(nivel);
    });
  }

  function refreshAll(nivel, animate) {
    title.setTitle(nivel, animate);
    metrics.setMetrics(nivel, animate);
    background.setLevel(nivel, animate);
    renderProgressPanel(nivel);
  }

  controller.init();
  pagination.setIndex(courseState.activeIndex, false);
  refreshAll(niveles[courseState.activeIndex], false);

  function goTo(dir) {
    controller.step(dir, {
      onMidpoint: (nivel) => refreshAll(nivel, true),
      onComplete: () => pagination.setIndex(courseState.activeIndex, true),
    });
  }

  // ── Menú "todos los niveles": revela el panel con la grilla completa
  // (buildNivelCards, ya existente) para navegación directa/accesible. ──
  function setMenuOpen(open) {
    if (!menuBtn || !menuPanel) return;
    menuPanel.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn?.addEventListener('click', () => {
    setMenuOpen(menuPanel?.hidden !== false);
  });

  const destroyNav = initNavigation(root, {
    onNext: () => goTo(1),
    onPrev: () => goTo(-1),
    onOpen: openActiveLevel,
    onEscape: () => setMenuOpen(false),
  });

  // ── Parallax de mouse (desactivado con prefers-reduced-motion) ──
  function onMouseMove(e) {
    const r = root.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    background.applyParallax(nx, ny);
  }
  if (!reduced) {
    root.addEventListener('mousemove', onMouseMove);
    root.addEventListener('mouseleave', () => background.resetParallax());
  }

  // ── Sincronía de progreso: cualquier check (carousel o menú) refresca
  // las 3 cards visibles + el panel de progreso del nivel activo. ──
  document.addEventListener('course-progress:change', (e) => {
    const id = e.detail?.id;
    cards.forEach((card) => refreshCardCompletion(card, id));
    const activeNivel = niveles[courseState.activeIndex];
    if (activeNivel?.id === id) renderProgressPanel(activeNivel);
  });

  let resizeRaf = null;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => controller.recomputeStep());
  });

  return {
    destroy() {
      destroyNav();
      controller.destroy();
    },
  };
}
