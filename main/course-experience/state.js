// ─── Estado puro del carousel de niveles (sin DOM) ───
// Índice activo (0..N-1) + flag anti doble-transición. Todo lo demás
// (progreso completado, feedback) sigue viviendo en ../../progress.js —
// este módulo NO duplica ese storage, solo orquesta qué nivel está activo.
import { niveles } from '../../data/niveles.js';

const N = niveles.length;

export const courseState = {
  activeIndex: 0,
  isAnimating: false,
};

/** Normaliza cualquier entero al rango circular [0, N-1]. */
export function wrapIndex(i) {
  return ((i % N) + N) % N;
}

/** Nivel en `activeIndex + offset` (circular). */
export function levelAt(offset = 0) {
  return niveles[wrapIndex(courseState.activeIndex + offset)];
}

export function totalLevels() {
  return N;
}

export function setActiveIndex(i) {
  courseState.activeIndex = wrapIndex(i);
}
