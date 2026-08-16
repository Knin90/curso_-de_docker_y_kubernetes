import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reducedMotion } from './atmosphere/shared.js';
import { buildParticles, buildSectionGlows, initHoverReaction, initGlobalPulse } from './atmosphere/glows.js';
import { initAtmosphereParallax, initStormArc, initVortexScroll } from './atmosphere/parallax.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * Atmósfera del landing — tres capas de profundidad:
 *
 *  1. Partículas ambientales: polvo de luz fijo que deriva y pulsa en toda la
 *     página y se desplaza con un parallax propio (capa "cercana").
 *  2. Orbes de glow por sección: glows de color según la identidad de cada
 *     bloque (cian, índigo, azul Docker, naranja Compose…) que se mueven con
 *     el scroll a velocidades distintas según su `depth`.
 *  3. Parallax de la atmósfera global: la capa fija `.atmosphere` (profundidad
 *     índigo + textura) deriva lentamente sobre su background-position, de modo
 *     que el fondo "retrocede" más lento que el contenido.
 *
 *  Además, un pulso global: cuando el vórtice WebGL del hero dispara un golpe
 *  de partículas (scroll rápido, evento `vortex:pulse`), todos los orbes de
 *  la página destellan sincronizados a través del canal `--bright`.
 *
 * Todo respeta `prefers-reduced-motion: reduce`. Detalle de cada capa: ver
 * ./atmosphere/glows.js (partículas + orbes) y ./atmosphere/parallax.js
 * (parallax global + arco de la tormenta + descenso del vórtice).
 */
export function initAtmosphere() {
  const particlesEl = document.getElementById('atmosphere-particles');
  if (particlesEl && !reducedMotion()) buildParticles(particlesEl);

  buildSectionGlows();
  initHoverReaction();
  initGlobalPulse();
  initAtmosphereParallax();
  initStormArc();
  initVortexScroll();
}
