// ─── Modo escenas: zoom por scroll entre módulos (estilo ui8.ai/forge) ───
// Cada módulo (.nivel-sec) es una escena de pantalla completa. Un stage
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
//
// El motor de scroll/zoom/snap vive en ../scene-engine.js — compartido con
// el landing (main/landing-scenes.js). Este archivo solo aporta el contexto
// de la página de nivel: las escenas ya renderizadas, el HUD de secciones,
// el revelado del contenido y las animaciones extra (header + atmósfera).
import { gsap } from 'gsap';
import { sceneState } from './scene-state.js';
import { createHud } from './scenes-hud.js';
import { createSceneEngine } from '../scene-engine.js';

export function initSceneZoom(nivel) {
  const wrap = document.getElementById('nivel-scenes');
  const stage = document.getElementById('nivel-content');
  if (!wrap || !stage) return;

  const scenes = [...stage.querySelectorAll('.nivel-sec')];
  const N = scenes.length;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (N < 2 || reduced) return;

  const atmosphere = document.querySelector('.atmosphere');
  const header = document.getElementById('nivel-header');
  const hud = createHud(nivel);

  // Revelado escalonado del contenido de un módulo al entrar en escena.
  const playEntrance = (idx) => {
    const scene = scenes[idx];
    if (!scene) return;
    const body = scene.querySelector('.nivel-scene__body');
    if (!body) return;
    gsap.fromTo(
      body.children,
      { y: 26, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.65,
        stagger: 0.07,
        ease: 'power3.out',
        overwrite: 'auto',
      },
    );
    body
      .querySelectorAll('.items-list__item, .lab-step, .history-list li, .comparison-table tbody tr')
      .forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            delay: i * 0.04,
            ease: 'power2.out',
            overwrite: 'auto',
          },
        );
      });
  };

  // Animaciones extra de la página de nivel: cámara que entra (el header se
  // aleja mientras el stage lo cubre) y atmósfera que gana profundidad.
  const setupExtras = ({ wrap, totalScroll, ENTER_FADE }) => {
    if (header) {
      gsap.fromTo(
        header,
        { scale: 1 },
        {
          scale: 1.15,
          ease: 'none',
          transformOrigin: '50% 45%',
          scrollTrigger: { trigger: wrap, start: 'top top', end: `+=${ENTER_FADE}`, scrub: true },
        },
      );
    }
    if (atmosphere) {
      gsap.fromTo(
        atmosphere,
        { scale: 1 },
        {
          scale: 1.16,
          ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top top', end: () => `+=${totalScroll()}`, scrub: 1 },
        },
      );
    }
  };

  createSceneEngine({
    wrap,
    stage,
    scenes,
    state: sceneState,
    hud,
    playEntrance,
    // Scrollspy del sidebar: notifica el módulo activo (-1 al salir).
    onActiveChange: (i) => sceneState.setActive?.(i),
    setupExtras,
  });
}
