// ─── Matemática del hiperboloide pellizcado (la forma del tornado) y sus
// utilidades de interpolación/muestreo. ───
import { CURVE_SAMPLES, STRAND_SEGMENTS, FORM_HEIGHT } from './config.js';

export const TAU = Math.PI * 2;
export const clamp = (x, a, b) => Math.min(Math.max(x, a), b);

export function ramp(now, from, to) {
  if (now <= from) return 0;
  if (now >= to) return 1;
  const t = (now - from) / (to - from);
  return 1 - (1 - t) * (1 - t) * (1 - t);
}

/** Monotone cubic interpolation (Fritsch–Carlson) — keeps the waist pinch from overshooting. */
export function monotone(points) {
  const n = points.length;
  const slope = [];
  for (let i = 0; i < n - 1; i++) {
    slope[i] = (points[i + 1][1] - points[i][1]) / (points[i + 1][0] - points[i][0]);
  }
  const m = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    m[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  }
  m[n - 1] = slope[n - 2];
  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(slope[i]) < 1e-12) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i];
    const b = m[i + 1] / slope[i];
    const s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      m[i] = k * a * slope[i];
      m[i + 1] = k * b * slope[i];
    }
  }
  return (x) => {
    if (x <= points[0][0]) return points[0][1];
    if (x >= points[n - 1][0]) return points[n - 1][1];
    let i = 0;
    while (i < n - 2 && points[i + 1][0] < x) i++;
    const h = points[i + 1][0] - points[i][0];
    const t = (x - points[i][0]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * points[i][1] +
      (t3 - 2 * t2 + t) * h * m[i] +
      (-2 * t3 + 3 * t2) * points[i + 1][1] +
      (t3 - t2) * h * m[i + 1]
    );
  };
}

export function bake(fn) {
  const table = new Float32Array(CURVE_SAMPLES);
  for (let i = 0; i < CURVE_SAMPLES; i++) table[i] = fn(i / (CURVE_SAMPLES - 1));
  return table;
}

export function sample(table, t) {
  if (t <= 0) return table[0];
  const last = table.length - 1;
  if (t >= 1) return table[last];
  const x = t * last;
  const i = x | 0;
  return table[i] + (table[i + 1] - table[i]) * (x - i);
}

export function makeShape(cfg) {
  const w = clamp(cfg.waistAt, 0.08, 0.92);
  const floor = cfg.floorRadius;
  const crown = cfg.crownRadius;
  const turn = cfg.twist * TAU;

  const radius = bake(
    monotone([
      [0, floor],
      [0.24 * w, floor * 0.667],
      [0.5 * w, floor * 0.3],
      [0.76 * w, floor * 0.08],
      [w, cfg.waistRadius],
      [w + 0.3 * (1 - w), crown * 0.2],
      [w + 0.6 * (1 - w), crown * 0.44],
      [1, crown],
    ]),
  );
  const height = bake(
    monotone([
      [0, 0],
      [0.1, 0.2],
      [0.2, 0.8],
      [0.35, 2],
      [0.5, FORM_HEIGHT * 0.38],
      [0.75, FORM_HEIGHT * 0.7],
      [1, FORM_HEIGHT],
    ]),
  );
  const angle = bake(
    monotone([
      [0, 0],
      [0.15, 0.15 * turn],
      [0.25, 0.25 * turn],
      [0.45, 0.55 * turn],
      [0.6, 0.7 * turn],
      [0.8, 0.88 * turn],
      [1, turn],
    ]),
  );

  return {
    writePoint(out, at, s, lane, flow, wobble, phase, time) {
      const r = sample(radius, s);
      const y = sample(height, s);
      const a = sample(angle, s) + lane + flow;
      const rr = r + Math.sin(s * 25 + phase + time * 0.3) * wobble * r;
      out[at] = Math.cos(a) * rr;
      out[at + 1] = y;
      out[at + 2] = Math.sin(a) * rr;
    },
    lane: (i, total) => (i / total) * TAU,
  };
}

// Re-exportado para quien solo necesite el largo del segmento del strand.
export { STRAND_SEGMENTS };
