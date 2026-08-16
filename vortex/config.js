// ─── Props públicas del vórtice → config interna del motor, y las
// constantes de tuning del hero-18 de Originkit. ───

export const PX_PER_WORLD = 60;
export const CURVE_SAMPLES = 1024;
export const STRAND_SEGMENTS = 400;
export const WOBBLE = 0.008;
export const FADE_ZONE = 0.15;
export const FORM_HEIGHT = 10;
export const BASE_ZOOM = 67;

export const LINE_GLOW_MAX = 1;
export const DOT_GLOW_MAX = 4.2;
export const COMET_SPEED_MAX = 0.15;
export const COMET_GLOW_MAX = 1;
export const DOT_SIZE_SCALE = 1000;

export const RIPPLE_RADIUS = 2;
export const RIPPLE_STRENGTH = 0.5;
export const RIPPLE_SPRING = 50;
export const RIPPLE_DAMPING = 9;
export const SCALE_SPRING = 65;
export const SCALE_DAMPING = 11;
export const SCALE_PEAK = 1.8;

export const WAVE_SPEED = 5;
export const WAVE_WIDTH = 1.2;
export const WAVE_DECAY = 0.8;
export const WAVE_LIFE = 2.5;
export const WAVE_STRENGTH = 0.04;
export const MAX_WAVES = 16;

export const RUN_LOW = 0.03;
export const RUN_HIGH = 0.95;
export const RUN_FADE = 0.1;

export const HIT_RADIUS = 0.8;
export const HIT_BOOST = 1.6;
export const HIT_BOOST_TIME = 0.4;
export const HIT_FLASH = 6;
export const HIT_FADE = 0.6;
export const HIT_POP = 1.3;
export const HIT_RESPAWN = 8;

export const STRAND_HZ = 1 / 30;

export const ENTRANCE = {
  strandStart: 0,
  strandEnd: 2,
  dotStart: 1.2,
  dotEnd: 3,
  cometStart: 3,
  cometEnd: 5,
};

export const REPEL_MAX_NDC = 0.45;

/** Valores por defecto: la configuración del hero-18 de Originkit. */
export const DEFAULT_PROPS = {
  topRadius: 380,
  waistRadius: 53,
  waistPosition: 50,
  bottomRadius: 1150,
  twist: 3,
  zoom: 75,
  speed: 10,
  direction: 'right', // 'right' | 'left'
  lineOptions: { count: 240, color: '#22d3ee', glow: 5 },
  dots: true,
  dotOptions: { count: 5000, size: 20, color: '#ffffff', glow: 0.8, flicker: 10 },
  comets: true,
  cometOptions: { count: 10, speed: 6, color: '#F9731A', glow: 6, tail: 19, delay: 8, collide: 6 },
  repel: false,
  repelOptions: { radius: 60, strength: 10 },
  halo: true, // anillo de energía sobre el contenedor (vortex-energy)
  scrollReaction: true, // energía/momentum por scroll + golpes de partículas
  pulseEvent: true, // emite `vortex:pulse` en window en cada golpe
  // Blend de render: 'additive' para fondos oscuros (el tornado suma luz) y
  // 'normal' para el tema claro, donde las partículas se dibujan opacas con
  // colores más oscuros (paleta por tema desde hero-vortex.js).
  blend: 'additive',
};

/* Merge profundo de props parciales sobre la base (los sub-objetos de opciones
   se combinan campo a campo, no se reemplazan enteros). */
export function mergeProps(input = {}, base = DEFAULT_PROPS) {
  const result = { ...base, ...input };
  for (const key of ['lineOptions', 'dotOptions', 'cometOptions', 'repelOptions']) {
    result[key] = { ...base[key], ...(input[key] || {}) };
  }
  return result;
}

/* Props públicas → config interna del motor. */
export function buildConfig(props, reduced) {
  const line = props.lineOptions;
  const dot = props.dotOptions;
  const comet = props.cometOptions;
  const shove = props.repelOptions;
  return {
    floorRadius: props.bottomRadius / PX_PER_WORLD,
    waistRadius: props.waistRadius / PX_PER_WORLD,
    crownRadius: props.topRadius / PX_PER_WORLD,
    waistAt: 1 - props.waistPosition / 100,
    twist: props.twist,
    zoom: props.zoom,
    flowDir: props.direction === 'left' ? -1 : 1,
    flowSpeed: (props.speed / 100) * (props.direction === 'left' ? -1 : 1),
    lineCount: line.count,
    lineColor: line.color,
    lineGlow: (line.glow / 10) * LINE_GLOW_MAX,
    showDots: props.dots,
    dotCount: dot.count,
    dotSize: dot.size / DOT_SIZE_SCALE,
    dotColor: dot.color,
    dotGlow: (dot.glow / 10) * DOT_GLOW_MAX,
    dotFlicker: dot.flicker / 10,
    showComets: props.comets,
    cometCount: comet.count,
    cometSpeed: (comet.speed / 10) * COMET_SPEED_MAX,
    cometColor: comet.color,
    cometGlow: (comet.glow / 10) * COMET_GLOW_MAX,
    cometTail: comet.tail,
    cometDelay: comet.delay,
    collideForce: comet.collide / 10,
    hoverRepel: props.repel,
    repelRadius: shove.radius,
    repelStrength: shove.strength,
    pulseEvent: props.pulseEvent !== false,
    blend: props.blend === 'normal' ? 'normal' : 'additive',
    running: !reduced,
  };
}

export function fovForZoom(zoom) {
  return Math.min(Math.max(2 * BASE_ZOOM - zoom, 1), 175);
}
