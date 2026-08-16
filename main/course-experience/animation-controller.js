// ─── Timelines GSAP centralizadas del carousel ───
// Mantiene 5 cards persistentes en offsets [-2..2] y las desplaza
// físicamente (translateX vía x + scale/opacity/filter) al navegar,
// reciclando el buffer que sale de rango como el nuevo buffer del otro
// extremo — nunca se destruyen/recrean nodos, nunca se duplican.
import { gsap } from 'gsap';
import { niveles } from '../../data/niveles.js';
import { courseState, wrapIndex } from './state.js';
import { OFFSETS, renderCardContent, placeInstant, styleForOffset, computeStep } from './cards.js';

function levelAtIndex(i) {
  return niveles[wrapIndex(i)];
}

export function createAnimationController({ container, cards }) {
  let stepPx = computeStep(container);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function findCardByOffset(offset) {
    return cards.find((c) => Number(c.el.dataset.offset) === offset);
  }

  function init() {
    OFFSETS.forEach((offset, i) => {
      const card = cards[i];
      renderCardContent(card, levelAtIndex(courseState.activeIndex + offset));
      placeInstant(card, offset, stepPx);
    });
  }

  function recomputeStep() {
    stepPx = computeStep(container);
    cards.forEach((card) => placeInstant(card, Number(card.el.dataset.offset), stepPx));
  }

  /**
   * dir = +1 (siguiente) | -1 (anterior). Ignora el input si ya hay una
   * transición en curso (anti doble-transición, nunca encola).
   */
  function step(dir, { onMidpoint, onComplete } = {}) {
    if (courseState.isAnimating) return null;
    courseState.isAnimating = true;

    const newActiveIndex = wrapIndex(courseState.activeIndex + dir);

    // prefers-reduced-motion: sin desplazamiento físico ni parallax — solo
    // un fade simple, conservando navegación y contenido íntegros.
    if (reducedMotion) {
      courseState.activeIndex = newActiveIndex;
      OFFSETS.forEach((offset, i) => {
        renderCardContent(cards[i], levelAtIndex(newActiveIndex + offset));
        placeInstant(cards[i], offset, stepPx);
      });
      const active = findCardByOffset(0);
      const tl = gsap.timeline({
        onComplete: () => {
          courseState.isAnimating = false;
          onComplete?.(levelAtIndex(newActiveIndex));
        },
      });
      if (active) tl.fromTo(active.el, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power1.out' });
      onMidpoint?.(levelAtIndex(newActiveIndex));
      return tl;
    }

    const recycled = findCardByOffset(dir === 1 ? -2 : 2);
    const newBufferOffset = dir === 1 ? 3 : -3;
    const newBufferIndex = newActiveIndex + (dir === 1 ? 2 : -2);
    renderCardContent(recycled, levelAtIndex(newBufferIndex));
    placeInstant(recycled, newBufferOffset, stepPx);

    const tl = gsap.timeline({
      defaults: { duration: 0.62, ease: 'power3.inOut', overwrite: 'auto' },
      onComplete: () => {
        courseState.activeIndex = newActiveIndex;
        cards.forEach((card) => placeInstant(card, Number(card.el.dataset.offset), stepPx));
        courseState.isAnimating = false;
        onComplete?.(levelAtIndex(newActiveIndex));
      },
    });

    cards.forEach((card) => {
      const currentOffset = Number(card.el.dataset.offset);
      const targetOffset = currentOffset - dir;
      card.el.dataset.offset = String(targetOffset);
      const s = styleForOffset(targetOffset, stepPx);
      gsap.set(card.el, { zIndex: s.zIndex });
      tl.to(card.el, { x: s.x, scale: s.scale, opacity: s.opacity, filter: s.filter }, 0);
    });

    if (onMidpoint) tl.call(() => onMidpoint(levelAtIndex(newActiveIndex)), null, 0.18);

    return tl;
  }

  /** Anima la salida de la card activa antes de navegar a nivel.html. */
  function openActive(onDone) {
    if (courseState.isAnimating) return;
    courseState.isAnimating = true;
    const active = findCardByOffset(0);
    if (!active) {
      onDone?.();
      return;
    }
    gsap.to(active.el, {
      scale: 1.08,
      opacity: 0,
      filter: 'blur(6px)',
      duration: 0.38,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => {
        courseState.isAnimating = false;
        onDone?.();
      },
    });
  }

  function destroy() {
    cards.forEach((c) => gsap.killTweensOf(c.el));
  }

  return { init, step, openActive, recomputeStep, destroy };
}
