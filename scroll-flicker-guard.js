// ─── Anti-parpadeo de hover al scrollear listas (tarjetas, items, pasos de
// laboratorio) — versión de PÁGINA COMPLETA (scroll normal del documento).
// El motor de escenas (scene-engine.js) ya cubre el scroll INTERNO de cada
// módulo; esto cubre el resto: cualquier lista larga en flujo normal (sin
// el modo escenas, o fuera de él) donde el cursor queda quieto y el
// contenido se mueve debajo, dispara :hover en cada elemento que pasa por
// debajo — se ve como parpadeo. Mismo criterio: se apaga pointer-events
// mientras hay scroll activo y se restaura ~120ms después del último evento. ───
export function initScrollFlickerGuard() {
  let timer = null;
  window.addEventListener(
    'scroll',
    () => {
      document.body.classList.add('page-is-scrolling');
      clearTimeout(timer);
      timer = setTimeout(() => document.body.classList.remove('page-is-scrolling'), 120);
    },
    { passive: true },
  );
}
