// ─── Título grande del nivel activo: crossfade simple (y + opacity) ───
import { gsap } from 'gsap';

export function createTitle(el) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setTitle(nivel, animate = true) {
    if (!el) return;
    if (!animate || reduced) {
      el.textContent = nivel.title;
      return;
    }
    gsap.killTweensOf(el);
    const tl = gsap.timeline();
    tl.to(el, { y: -10, opacity: 0, duration: 0.22, ease: 'power2.in' });
    tl.call(() => {
      el.textContent = nivel.title;
    });
    tl.fromTo(el, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: 'power2.out' });
    return tl;
  }

  return { setTitle };
}
