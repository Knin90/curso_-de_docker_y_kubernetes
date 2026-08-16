// ─── Reacción al scroll: energía (0..1) y momentum (-1..1) del gesto,
// escritos en `scroll` desde un listener con rAF; el motor los decae cada
// frame. Con scroll rápido dispara `api.pulse()` (throttled): el golpe de
// partículas + el pulso global. ───
import { clamp } from './shape.js';

export function initScrollReaction(container, scroll, api) {
  let rafScroll = 0;
  let lastY = window.scrollY;
  let lastT = performance.now();
  let smoothV = 0;
  let lastPulseAt = 0;

  const computeScroll = () => {
    rafScroll = 0;
    const now = performance.now();
    const dt = Math.max((now - lastT) / 1000, 1e-3);
    const v = (window.scrollY - lastY) / dt; // velocidad CON signo
    lastY = window.scrollY;
    lastT = now;
    smoothV += (v - smoothV) * Math.min(1, dt * 5);

    // Presencia del contenedor: fuera de la vista, no reacciona.
    const rect = container.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const visible = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
    const presence = clamp(visible / Math.max(rect.height, 1), 0, 1);

    scroll.energy = clamp(Math.abs(smoothV) / 1500, 0, 1) * presence;
    // momentum: magnitud + dirección del gesto (signo).
    scroll.momentum = clamp(smoothV / 1500, -1, 1) * presence;

    // Scroll rápido → golpe de partículas + pulso global de los orbes (con
    // throttle). Sin gate de presencia: el pulso es un efecto de página
    // entera (atmosphere.js destella todas las secciones), no solo del hero,
    // y un gate de presencia lo mataría justo al salir el vórtice de vista.
    if (Math.abs(smoothV) > 1600 && now - lastPulseAt > 420) {
      lastPulseAt = now;
      api.pulse();
    }
  };

  const onScroll = () => {
    if (!rafScroll) rafScroll = requestAnimationFrame(computeScroll);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  return {
    dispose() {
      window.removeEventListener('scroll', onScroll);
      if (rafScroll) cancelAnimationFrame(rafScroll);
    },
  };
}
