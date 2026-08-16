// ─── Guardias de scroll interno de cada escena (DRY, extraído de
// scene-engine.js) ───
// Dos cosas que el scroll interno de un módulo necesita, sin relación con la
// física de snap entre módulos:
//   1. Anti-parpadeo: con el cursor quieto y el contenido moviéndose debajo
//      (scroll con rueda/trackpad), cada tarjeta que pasa bajo el puntero
//      dispara su :hover — se ve como parpadeo. Mientras la escena scrollea
//      se apaga pointer-events (CSS, .scene-is-scrolling) y se restaura
//      ~120ms después del último scroll.
//   2. Desvanecido de "hay más abajo": cuando el contenido es más alto que
//      la pantalla (grillas de tarjetas largas, laboratorios), la última
//      fila queda cortada en seco en el borde del viewport, sin indicio de
//      que hay más — se ve "rota". `scene-has-more-below` (mask-image, ver
//      scenes.css) desvanece ese borde en vez de cortarlo, y desaparece
//      solo al llegar al final real del contenido.
export function setupScrollGuards(scenes, scroller) {
  const scrollFlickerTimers = new WeakMap();
  const fadeUpdaters = scenes.map((scene) => {
    const el = scroller(scene);
    if (!el) return null;

    const updateFade = () => {
      const hasMore = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      el.classList.toggle('scene-has-more-below', hasMore);
    };
    updateFade();

    el.addEventListener(
      'scroll',
      () => {
        scene.classList.add('scene-is-scrolling');
        clearTimeout(scrollFlickerTimers.get(scene));
        scrollFlickerTimers.set(
          scene,
          setTimeout(() => scene.classList.remove('scene-is-scrolling'), 120),
        );
        updateFade();
      },
      { passive: true },
    );

    return updateFade;
  });

  window.addEventListener('resize', () => fadeUpdaters.forEach((fn) => fn?.()));

  return { fadeUpdaters };
}
