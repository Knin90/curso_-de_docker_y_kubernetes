// ─── Render + estado visual de las cards del carousel ───
// Se mantienen 5 elementos DOM persistentes en offsets [-2,-1,0,1,2]
// relativos al nivel activo (solo -1/0/1 son visibles; ±2 son buffers
// invisibles fuera de pantalla que la animación recicla al navegar — así
// la transición es un desplazamiento físico real, no un redibujado).
import { gsap } from 'gsap';
import { isCompleted, toggleCompleted } from '../../progress.js';

export const OFFSETS = [-2, -1, 0, 1, 2];

const ETAPA_LABEL = { docker: 'Docker', compose: 'Compose', k8s: 'Kubernetes' };

/** Valores visuales objetivo para un offset dado (usados por GSAP). */
export function styleForOffset(offset, stepPx) {
  const abs = Math.abs(offset);
  if (abs >= 2) {
    return { x: offset * stepPx * 1.15, scale: 0.6, opacity: 0, filter: 'blur(6px)', zIndex: 1 };
  }
  if (abs === 1) {
    return { x: offset * stepPx, scale: 0.82, opacity: 0.55, filter: 'blur(2px)', zIndex: 2 };
  }
  return { x: 0, scale: 1, opacity: 1, filter: 'blur(0px)', zIndex: 3 };
}

function cardMarkup(nivel) {
  const etapaLabel = ETAPA_LABEL[nivel.etapa] ?? nivel.etapa;
  const done = isCompleted(nivel.id);
  return `
    <div class="course-exp-card__glow" aria-hidden="true"></div>
    <div class="course-exp-card__head">
      <span class="course-exp-card__num">${String(nivel.id).padStart(2, '0')}</span>
      <span class="course-exp-card__etapa etapa--${nivel.etapa}">${etapaLabel}</span>
    </div>
    <h4 class="course-exp-card__title">${nivel.title}</h4>
    <button type="button" class="course-exp-card__check${done ? ' done' : ''}"
      data-id="${nivel.id}" aria-pressed="${done}"
      aria-label="${done ? 'Marcar como pendiente' : 'Marcar como completado'}">
      <i class="ph ph-check" aria-hidden="true"></i>
    </button>`;
}

/** Crea los 5 slots y los agrega al contenedor. Devuelve el array de cards. */
export function createCardSlots(container, onOpenActive) {
  return OFFSETS.map((offset) => {
    const el = document.createElement('div');
    el.className = 'course-exp-card';
    el.setAttribute('role', 'listitem');
    el.dataset.offset = String(offset);
    container.appendChild(el);
    el.addEventListener('click', (e) => {
      if (e.target.closest('.course-exp-card__check')) return;
      const cur = Number(el.dataset.offset);
      if (cur === 0) onOpenActive?.();
      else el.dispatchEvent(new CustomEvent('course-exp:navigate', { detail: { offset: cur }, bubbles: true }));
    });
    return { el, levelId: null };
  });
}

/** Vuelca el contenido del nivel `nivel` en la card `card.el`. */
export function renderCardContent(card, nivel) {
  card.levelId = nivel.id;
  card.el.dataset.levelId = String(nivel.id);
  card.el.setAttribute('aria-label', `Nivel ${nivel.id}: ${nivel.title}`);
  card.el.innerHTML = cardMarkup(nivel);
  const check = card.el.querySelector('.course-exp-card__check');
  check.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = Number(check.dataset.id);
    const done = toggleCompleted(id);
    check.classList.toggle('done', done);
    check.setAttribute('aria-pressed', String(done));
    check.setAttribute('aria-label', done ? 'Marcar como pendiente' : 'Marcar como completado');
    document.dispatchEvent(new CustomEvent('course-progress:change', { detail: { id, done } }));
  });
}

/** Refresca solo el estado visual de "completado" si la card muestra `id`. */
export function refreshCardCompletion(card, id) {
  if (card.levelId !== id) return;
  const check = card.el.querySelector('.course-exp-card__check');
  if (!check) return;
  const done = isCompleted(id);
  check.classList.toggle('done', done);
  check.setAttribute('aria-pressed', String(done));
}

/** Posiciona una card instantáneamente (sin animación) en su offset. */
export function placeInstant(card, offset, stepPx) {
  card.el.dataset.offset = String(offset);
  const s = styleForOffset(offset, stepPx);
  gsap.set(card.el, { xPercent: -50, yPercent: -50, x: s.x, scale: s.scale, opacity: s.opacity, filter: s.filter, zIndex: s.zIndex });
  card.el.style.pointerEvents = Math.abs(offset) >= 2 ? 'none' : 'auto';
  card.el.setAttribute('aria-hidden', String(Math.abs(offset) >= 1));
  card.el.setAttribute('aria-current', offset === 0 ? 'true' : 'false');
  card.el.tabIndex = offset === 0 ? 0 : -1;
}

/** Ancho de "paso" entre cards, en px, según el ancho del stage. */
export function computeStep(container) {
  const w = container.clientWidth || window.innerWidth;
  return Math.max(120, Math.min(360, w * 0.32));
}
