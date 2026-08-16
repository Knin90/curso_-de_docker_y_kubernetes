// ─── Entry point del landing: solo boot. Cada responsabilidad real vive
// en ./main/*.js (tabs, tarjetas de nivel, escenas, motion) — ver ese
// directorio para el detalle de cada una. ───
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initTickerLogos } from './ticker-logos.js';
import { initAtmosphere } from './atmosphere.js';
import { initTheme } from './theme.js';
import { initScrollFlickerGuard } from './scroll-flicker-guard.js';

import { initEtapaTabs } from './main/etapa-tabs.js';
import {
  buildNivelCards,
  initProgressGrid,
  updateProgressSummary,
  initContinueCta,
} from './main/nivel-cards.js';
import { initToolLogos, initNavHighlight, initButtons } from './main/nav-misc.js';
import { initCourseExperience } from './main/course-experience/course-experience.js';
import { initLandingMotion } from './main/landing-motion.js';

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

document.addEventListener('DOMContentLoaded', () => {
  initTheme(document.getElementById('theme-toggle'));
  initScrollFlickerGuard();
  initEtapaTabs();
  initTickerLogos();
  initToolLogos();
  buildNivelCards();
  updateProgressSummary();
  initProgressGrid();
  initContinueCta();
  initAtmosphere();
  // Carousel horizontal cinematográfico de niveles (reemplaza el modo
  // escenas anterior): fondo por etapa, 3 cards prev/activa/next,
  // parallax, teclado/swipe y panel "todos los niveles" con la grid ya
  // construida arriba por buildNivelCards().
  initCourseExperience();
  initNavHighlight();
  initButtons();
  initLandingMotion();

  // Vórtice WebGL (hero-18) se carga bajo demanda para no inflar el bundle inicial
  let vortexApi = null;
  import('./hero-vortex.js')
    .then(({ initHeroVortex }) => {
      vortexApi = initHeroVortex(document.getElementById('hero-vortex'));
    })
    .catch(() => {});

  // Cambio de tema (toggle o desde otra pestaña): el vórtice reconfigura su
  // paleta (blend aditivo oscuro ↔ normal claro) sin recargar la página.
  document.addEventListener('theme:change', (e) => {
    vortexApi?.setTheme?.(e.detail?.theme);
  });

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
});
