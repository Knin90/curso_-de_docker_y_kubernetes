// ─── Entry point de la página de nivel: solo boot. Cada responsabilidad
// real vive en ./nivel/*.js (render, sidebar, header, nav, escenas, GSAP,
// progreso/feedback) — ver ese directorio para el detalle de cada una. ───
import { getNivel } from './data/niveles.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initAtmosphere } from './atmosphere.js';
import { initTheme } from './theme.js';
import { setLastVisited } from './progress.js';
import { initScrollFlickerGuard } from './scroll-flicker-guard.js';

import { getCurrentId, setupNav } from './nivel/nav.js';
import { buildSidebar, initSectionSpy, setupSidebarMobile } from './nivel/sidebar.js';
import { renderHeader, buildStack3D } from './nivel/header.js';
import { renderContent } from './nivel/render.js';
import { initGSAP } from './nivel/gsap-init.js';
import { renderLevelProgress, initFeedback, initCompleteButton, setupProgress } from './nivel/progress-ui.js';

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

// ─── Boot ───
document.addEventListener('DOMContentLoaded', () => {
  initTheme(document.getElementById('theme-toggle'));
  initScrollFlickerGuard();
  const id = getCurrentId();
  const nivel = getNivel(id);

  if (!nivel) {
    document.getElementById('nivel-content').innerHTML = '<p style="color:red">Nivel no encontrado.</p>';
    return;
  }

  buildSidebar(id, nivel);
  renderHeader(nivel);
  buildStack3D(nivel);
  renderContent(nivel);
  // Modo escenas desactivado: el usuario pidió flujo normal de lectura
  // (todos los módulos en la página, uno debajo del otro, scroll continuo)
  // en vez de escenas pineadas a pantalla completa con zoom por scroll.
  // initSceneZoom(nivel) queda sin llamar; nivel/scenes.js y scene-engine.js
  // no se tocan (siguen vivos para el landing / por si se reactiva).
  initSectionSpy(id);
  initAtmosphere();
  setupNav(id);
  setupProgress();
  renderLevelProgress(id);
  setupSidebarMobile();
  initCompleteButton(nivel);
  initFeedback(id);
  initGSAP();

  // Registra el nivel como último visitado para el landing
  setLastVisited(id);
});
