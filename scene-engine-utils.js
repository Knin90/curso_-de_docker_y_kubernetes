// ─── Lógica pura del motor de escenas (testeable sin DOM) ───
// Las matemáticas del glide, el posicionamiento de módulos y las decisiones
// de scroll viven acá como funciones puras; scene-engine.js las importa y
// les inyecta los valores que necesita del DOM (wrap, window, escenas).
// Separadas para cubrirlas con tests unitarios sin jsdom (ver
// tests/scene-engine-utils.test.js) y para que el motor quede legible.
//
// Convención: las funciones reciben todo por parámetros — nunca leen
// window/document/escenas directamente.

/** Clampea `v` al rango [a, b] (a y b inclusivos). */
export function clamp(v, a = 0, b = 1) {
  return Math.min(b, Math.max(a, v));
}

/** Delta de tiempo del glide, acotado a 64ms (frenado de frame). */
export function glideDt(now, last) {
  return Math.min(64, now - (last || now));
}

/**
 * Un paso del lag filter exponencial: `current` persigue a `target` con
 * `current += (target - current) * (1 - exp(-dt/τ))`. A menor τ, más rápido
 * alcanza el target. Devuelve el nuevo valor amortiguado.
 */
export function glideStepY(current, target, dt, tau) {
  return current + (target - current) * (1 - Math.exp(-dt / tau));
}

/**
 * Posición Y del scroll donde el módulo `k` se asienta. `start` es el top
 * del wrapper en coordenadas de documento; los módulos se distribuyen sobre
 * `sceneEnd` (el snap del último aterriza antes de la pista de salida) y el
 * módulo 0 arranca pasado el fundido de entrada (`enterFade`).
 */
export function moduleY(start, k, N, sceneEnd, enterFade) {
  const idx = clamp(k, 0, N - 1);
  const entryOffset = idx === 0 ? enterFade * 0.8 : 0;
  // Un solo módulo: no hay recorrido que distribuir (evita 0/0 = NaN).
  if (N <= 1) return start + entryOffset;
  return start + (idx / (N - 1)) * sceneEnd + entryOffset;
}

/** ¿La escena puede scrollear internamente en esa dirección? */
export function canSceneScroll(scene, dir) {
  if (!scene) return false;
  if (dir > 0) return scene.scrollTop < scene.scrollHeight - scene.clientHeight - 1;
  return scene.scrollTop > 1;
}

/** ¿El scroll ya pasó el fundido de entrada del stage? */
export function enteredStage(scrollY, wrapStart, enterFade) {
  return scrollY > wrapStart + enterFade * 0.4;
}

/**
 * Transición de escenas según la posición flotante `sf` en [0, N-1]:
 * devuelve el índice de la escena activa `k`, la fracción `t` del zoom de
 * paso (0..1) y el "punch" de escala por velocidad de scroll (`vel`, px/s).
 */
export function sceneTransition(sf, N, TRANS, vel = 0) {
  // Un solo módulo: no hay transición que recorrer (evita k = -1 por el
  // clamp a N-1-ε con N=1). La escena única queda a escala 1, t completa.
  if (N <= 1) return { k: 0, t: 1, punch: 0 };
  const s = clamp(sf, 0, N - 1 - 1e-4);
  const k = Math.floor(s);
  const local = s - k;
  const t = clamp((local - (1 - TRANS)) / TRANS);
  const punch = clamp(Math.abs(vel) / 5000, 0, 0.035);
  return { k, t, punch };
}

/** Índice del módulo visible a partir del progreso flotante. */
export function activeIndexFromProgress(sf, N) {
  return clamp(Math.round(sf), 0, N - 1);
}
