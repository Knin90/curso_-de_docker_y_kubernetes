import { createVortex } from './vortex.js';

/**
 * Integración del landing: monta el tornado hero-18 sobre `wrap` usando el
 * componente reutilizable `vortex.js`. Mantiene la firma `initHeroVortex(wrap)`
 * y expone además `setTheme()` para reconfigurar la paleta al cambiar el tema
 * claro/oscuro del sitio.
 *
 * Paletas:
 *  - dark (por defecto): la configuración original de Originkit hero-18
 *    (blending aditivo, hilos cian, puntos blancos, cometas naranjas) —
 *    diseñada para fondo oscuro.
 *  - light: blending normal con colores oscuros (azul-sky, índigo, naranja
 *    quemado) para que el tornado se lea sobre el fondo claro sin perder la
 *    identidad de forma ni los acentos.
 */

const DARK_PALETTE = {
  blend: 'additive',
  lineOptions: { color: '#22d3ee', glow: 5 },
  dotOptions: { count: 5000, size: 20, color: '#ffffff', glow: 0.8, flicker: 10 },
  cometOptions: { count: 10, speed: 6, color: '#F9731A', glow: 6, tail: 19, delay: 8, collide: 6 },
};

const LIGHT_PALETTE = {
  blend: 'normal',
  lineOptions: { color: '#0369a1', glow: 5 },
  dotOptions: { count: 4200, size: 26, color: '#2a3f6e', glow: 1.15, flicker: 10 },
  cometOptions: { count: 8, speed: 6, color: '#d9480f', glow: 7, tail: 19, delay: 9, collide: 6 },
};

/** Tema actual del documento (lo aplica el anti-FOUC de <head>). */
function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

/**
 * Mount the hero-18 tornado into `wrap` (un contenedor `.hero__vortex`).
 * Returns { setTheme, dispose } or null if WebGL is unavailable.
 */
export function initHeroVortex(wrap) {
  if (!wrap) return null;

  try {
    const api = createVortex(wrap);
    const applyTheme = () => {
      // setProps reconstruye el motor (~entrada de 2s); al cambiar de tema
      // es la transición más limpia que ofrece el componente.
      api.setProps(currentTheme() === 'light' ? LIGHT_PALETTE : DARK_PALETTE);
    };
    applyTheme();

    return {
      setTheme: applyTheme,
      dispose: () => api.dispose(),
    };
  } catch (err) {
    // WebGL unavailable / context limit — degrade to a clean background.
    console.warn('[hero-vortex] init failed:', err);
    return null;
  }
}
