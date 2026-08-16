import {
  WebGLRenderer,
  ReinhardToneMapping,
  Scene,
  PerspectiveCamera,
  Group,
  Vector2,
  Vector3,
  Matrix4,
  Color,
  Texture,
  NormalBlending,
  AdditiveBlending,
  BufferGeometry,
  BufferAttribute,
  DynamicDrawUsage,
  LineBasicMaterial,
  LineSegments,
  PlaneGeometry,
  MeshBasicMaterial,
  InstancedMesh,
  InstancedBufferAttribute,
  Line,
  SpriteMaterial,
  Sprite,
} from 'three';
import {
  FORM_HEIGHT,
  BASE_ZOOM,
  WOBBLE,
  FADE_ZONE,
  STRAND_HZ,
  ENTRANCE,
  REPEL_MAX_NDC,
  RIPPLE_RADIUS,
  RIPPLE_STRENGTH,
  RIPPLE_SPRING,
  RIPPLE_DAMPING,
  SCALE_SPRING,
  SCALE_DAMPING,
  SCALE_PEAK,
  WAVE_SPEED,
  WAVE_WIDTH,
  WAVE_DECAY,
  WAVE_LIFE,
  WAVE_STRENGTH,
  MAX_WAVES,
  RUN_LOW,
  RUN_HIGH,
  RUN_FADE,
  HIT_RADIUS,
  HIT_BOOST,
  HIT_BOOST_TIME,
  HIT_FLASH,
  HIT_FADE,
  HIT_POP,
  HIT_RESPAWN,
  mergeProps,
  buildConfig,
  fovForZoom,
} from './vortex/config.js';
import { TAU, clamp, ramp, STRAND_SEGMENTS, makeShape } from './vortex/shape.js';
import { initScrollReaction } from './vortex/scroll-reaction.js';
import { buildHalo } from './vortex/halo.js';

/**
 * Vortex — component WebGL reutilizable: el tornado de partículas del diseño
 * Originkit "hero-18" (Tornado-Section), extraído a un componente con props.
 *
 * Uso:
 *   import { createVortex } from './vortex.js';
 *   const v = createVortex(el, {
 *     topRadius: 380, waistRadius: 53, bottomRadius: 1150, twist: 3,
 *     zoom: 75, speed: 10, direction: 'right',
 *     lineOptions: { count: 240, color: '#22d3ee', glow: 5 },
 *     dots: true, dotOptions: { count: 5000, size: 20, color: '#ffffff', glow: 0.8, flicker: 10 },
 *     comets: true, cometOptions: { count: 10, speed: 6, color: '#F9731A', glow: 6, tail: 19, delay: 8, collide: 6 },
 *     repel: false, repelOptions: { radius: 60, strength: 10 },
 *     halo: true,            // anillo de energía sobre el contenedor
 *     scrollReaction: true,  // energía/momentum por scroll + golpes de partículas
 *   });
 *   v.setProps({ lineOptions: { color: '#ff00aa' }, dots: false });
 *   v.pulse();
 *   v.dispose();
 *
 * Comportamiento del motor:
 *   - Strands espirales sobre un hiperboloide pellizcado (./vortex/shape.js);
 *     dots que las recorren y parpadean; cometas que las recorren — un
 *     impacto apaga la dot y lanza una onda por su alrededor.
 *   - Reacción al scroll (./vortex/scroll-reaction.js): la energía del gesto
 *     acelera el giro, enciende las partículas, acelera los cometas y acerca
 *     la cámara; el scroll rápido dispara golpes (pulse). Los cometas
 *     invierten su recorrido al invertir el gesto.
 *   - Cada golpe emite `vortex:pulse` en window (detail.strength) — la
 *     atmósfera de la página lo escucha para destellar los orbes al unísono.
 *   - Respeta `prefers-reduced-motion` (render estático, sin scroll ni halo).
 *
 * NOTA de mantenimiento: `createVortexEngine`, más abajo, queda deliberadamente
 * como un solo módulo pese a superar las ~400 líneas de referencia del resto
 * del proyecto. Es un motor de partículas afinado a mano con muchísimo estado
 * mutable compartido por closure (posiciones de strands, dots, cometas, ondas)
 * entre `build()`, el loop `step()` y los helpers de colisión/ripple. Partirlo
 * en módulos exige convertir todo ese estado en un objeto explícito pasado
 * entre funciones puras — un cambio real de forma, no solo de ubicación, y
 * sin poder verificar visualmente el resultado en este entorno (no hay canvas
 * WebGL renderizable aquí). El riesgo de introducir una regresión sutil en la
 * pieza visual más vistosa del sitio supera el beneficio de la métrica de
 * líneas. Lo que sí se extrajo sin riesgo — puro/sin estado compartido — vive
 * en ./vortex/config.js, ./vortex/shape.js, ./vortex/scroll-reaction.js y
 * ./vortex/halo.js.
 */

/* ============================================================ engine */

function createVortexEngine(canvas, container, cfg, scroll = {}, onFrame) {
  // `scroll.energy` (0..1) y `scroll.momentum` (-1..1, con signo de dirección)
  // los alimenta el listener de scroll del componente; aquí se leen y decaen
  // cada frame. `onFrame` recibe cada frame el estado { energy, flash } para
  // que el componente encienda el halo de energía sobre el contenedor.
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = ReinhardToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new Scene();
  const camera = new PerspectiveCamera(fovForZoom(cfg.zoom), 1, 0.1, 500);
  const group = new Group();
  scene.add(group);

  const repelUniforms = {
    uMouse: { value: new Vector2(0, 0) },
    uAspect: { value: 1 },
    uRadius: { value: 0.2 },
    uStrength: { value: 0 },
  };
  const withRepel = (material) => {
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uMouse = repelUniforms.uMouse;
      shader.uniforms.uAspect = repelUniforms.uAspect;
      shader.uniforms.uRadius = repelUniforms.uRadius;
      shader.uniforms.uStrength = repelUniforms.uStrength;
      shader.vertexShader = shader.vertexShader
        .replace(
          'void main() {',
          `
                    uniform vec2 uMouse;
                    uniform float uAspect;
                    uniform float uRadius;
                    uniform float uStrength;
                    void main() {
                    `,
        )
        .replace(
          '#include <fog_vertex>',
          `
                    #include <fog_vertex>
                    if (uStrength > 0.0 && uRadius > 0.0 && gl_Position.w > 0.0) {
                        vec2 ndc = gl_Position.xy / gl_Position.w;
                        vec2 off = ndc - uMouse;
                        float dist = length(off * vec2(uAspect, 1.0));
                        float f = uStrength * exp(-(dist * dist) / (2.0 * uRadius * uRadius));
                        float m = length(off);
                        if (m > 1e-4) {
                            ndc += (off / m) * f;
                            gl_Position.xy = ndc * gl_Position.w;
                        }
                    }
                    `,
        );
    };
    return material;
  };

  let shape;
  let disposables = [];
  const track = (x) => {
    disposables.push(x);
    return x;
  };

  let strands = [];
  let strandPos = new Float32Array(0);
  let strandCol = new Float32Array(0);
  let strandGeo = null;

  let dotList = [];
  let dotCount = 0;
  let dotMesh = null;
  let dotColors = new Float32Array(0);
  let dotHome = new Float32Array(0);
  let dotShift = new Float32Array(0);
  let dotVel = new Float32Array(0);
  let dotScale = new Float32Array(0);
  let dotScaleVel = new Float32Array(0);
  let dotHitAt = new Float32Array(0);
  let dotFlash = new Float32Array(0);
  let dotAlive = new Float32Array(0);
  let rippleAwake = false;

  let cometList = [];
  let cometTex = null;

  let waves = [];
  let wavesAwake = false;

  const dummy = new Matrix4();
  const dummyPos = new Vector3();
  const dummyScale = new Vector3();
  const tint = { strand: new Color(), dot: new Color(), comet: new Color() };
  // Piso de color hacia el que funden los hilos/puntos tenues (v bajo, ver
  // drawStrand y el loop de dots): con blend aditivo (tema oscuro) el piso
  // es negro, así v→0 no suma luz y el hilo se vuelve invisible sobre el
  // fondo oscuro (comportamiento original, sin cambios). Con blend normal
  // (tema claro) pintar hacia negro a opacidad fija dejaba una "mancha"
  // oscura visible sobre el fondo claro real — el piso pasa a ser ese fondo
  // claro (--bg del tema claro) para que v→0 funda hacia él y desaparezca.
  const base = { strand: new Color(), dot: new Color() };
  const lastColors = { line: '', dot: '', comet: '', blend: '' };

  function syncColors(c) {
    if (c.lineColor !== lastColors.line) {
      tint.strand.set(c.lineColor);
      lastColors.line = c.lineColor;
    }
    if (c.dotColor !== lastColors.dot) {
      tint.dot.set(c.dotColor);
      lastColors.dot = c.dotColor;
    }
    if (c.cometColor !== lastColors.comet) {
      tint.comet.set(c.cometColor);
      lastColors.comet = c.cometColor;
      for (const comet of cometList) {
        comet.head.material.color.setRGB(tint.comet.r * 1.2, tint.comet.g * 1.2, tint.comet.b * 1.2);
      }
    }
    if (c.blend !== lastColors.blend) {
      lastColors.blend = c.blend;
      const floor = c.blend === 'normal' ? 0xeef3fa : 0x000000;
      base.strand.setHex(floor);
      base.dot.setHex(floor);
    }
  }

  function blob(size, stops) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx2d = c.getContext('2d');
    if (ctx2d) {
      const g = ctx2d.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      for (const [at, color] of stops) g.addColorStop(at, color);
      ctx2d.fillStyle = g;
      ctx2d.fillRect(0, 0, size, size);
    }
    const tex = new Texture(c);
    tex.needsUpdate = true;
    return tex;
  }

  function build() {
    const c = cfg;
    // Blend por tema: aditivo sobre fondo oscuro (el tornado suma luz) y
    // normal sobre el tema claro (las partículas se dibujan opacas con la
    // paleta oscura que manda hero-vortex.js).
    const BLEND = c.blend === 'normal' ? NormalBlending : AdditiveBlending;

    for (let i = group.children.length - 1; i >= 0; i--) group.remove(group.children[i]);
    for (const d of disposables) d.dispose();
    disposables = [];

    shape = makeShape(c);
    camera.fov = fovForZoom(c.zoom);
    camera.updateProjectionMatrix();

    syncColors(c);

    const count = Math.max(3, Math.round(c.lineCount));
    const segs = STRAND_SEGMENTS - 1;
    const verts = count * segs * 2;
    strandPos = new Float32Array(verts * 3);
    strandCol = new Float32Array(verts * 3);
    strandGeo = track(new BufferGeometry());
    strandGeo.setAttribute('position', new BufferAttribute(strandPos, 3).setUsage(DynamicDrawUsage));
    strandGeo.setAttribute('color', new BufferAttribute(strandCol, 3).setUsage(DynamicDrawUsage));
    const strandMat = track(
      withRepel(
        new LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.5,
          blending: BLEND,
          depthWrite: false,
        }),
      ),
    );
    const strandLines = new LineSegments(strandGeo, strandMat);
    strandLines.frustumCulled = false;
    group.add(strandLines);

    strands = [];
    for (let i = 0; i < count; i++) {
      strands.push({
        lane: shape.lane(i, count),
        speed: 0.95 + Math.random() * 0.1,
        pulse: Math.random() * TAU,
        wobblePhase: Math.random() * TAU,
        from: 0,
        to: 1,
        bright: 0.5,
        offset: i * segs * 2 * 3,
        pts: new Float32Array(STRAND_SEGMENTS * 3),
        cols: new Float32Array(STRAND_SEGMENTS * 3),
      });
    }

    dotCount = c.showDots ? Math.max(0, Math.round(c.dotCount)) : 0;
    dotList = [];
    for (let i = 0; i < dotCount; i++) {
      const s = Math.random() < 0.5 ? 0.2 + Math.random() * 0.4 : 0.05 + Math.random() * 0.9;
      const strand = Math.floor(Math.random() * strands.length);
      dotList.push({
        s,
        lane: strands[strand].lane,
        strand,
        pulse: Math.random() * TAU,
        flickerRate: 0.15 + Math.random() * 4.5,
        bright: 0.04 + Math.random() ** 1.5 * 0.96,
      });
    }

    dotHome = new Float32Array(dotCount * 3);
    dotShift = new Float32Array(dotCount * 3);
    dotVel = new Float32Array(dotCount * 3);
    dotScale = new Float32Array(dotCount).fill(1);
    dotScaleVel = new Float32Array(dotCount);
    dotHitAt = new Float32Array(dotCount);
    dotFlash = new Float32Array(dotCount);
    dotAlive = new Float32Array(dotCount).fill(1);
    dotColors = new Float32Array(dotCount * 3);
    rippleAwake = false;

    if (dotCount > 0) {
      const dotGeo = track(new PlaneGeometry(1, 1));
      const dotMat = track(
        withRepel(
          new MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
            blending: BLEND,
            depthWrite: false,
          }),
        ),
      );
      dotMesh = new InstancedMesh(dotGeo, dotMat, dotCount);
      dotMesh.instanceMatrix.setUsage(DynamicDrawUsage);
      dotMesh.instanceColor = new InstancedBufferAttribute(dotColors, 3);
      dotMesh.instanceColor.setUsage(DynamicDrawUsage);
      dotMesh.frustumCulled = false;
      group.add(dotMesh);
    } else {
      dotMesh = null;
    }

    waves = [];
    for (let i = 0; i < MAX_WAVES; i++) waves.push({ active: false, x: 0, y: 0, z: 0, at: 0, amp: 1 });
    wavesAwake = false;

    cometTex = track(
      blob(32, [
        [0, 'rgba(255,255,255,0.9)'],
        [0.3, 'rgba(255,120,255,0.4)'],
        [0.7, 'rgba(200,50,200,0.08)'],
        [1, 'rgba(0,0,0,0)'],
      ]),
    );
    const cometTotal = c.showComets ? Math.max(0, Math.round(c.cometCount)) : 0;
    const tailLen = Math.max(2, Math.round(c.cometTail));
    cometList = [];
    for (let i = 0; i < cometTotal; i++) {
      const trail = new Float32Array(tailLen * 3);
      const trailCol = new Float32Array(tailLen * 3);
      const geo = track(new BufferGeometry());
      geo.setAttribute('position', new BufferAttribute(trail, 3).setUsage(DynamicDrawUsage));
      geo.setAttribute('color', new BufferAttribute(trailCol, 3).setUsage(DynamicDrawUsage));
      const lineMat = track(
        withRepel(
          new LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: BLEND,
            depthWrite: false,
          }),
        ),
      );
      const line = new Line(geo, lineMat);
      line.frustumCulled = false;

      const headMat = track(
        new SpriteMaterial({
          map: cometTex,
          transparent: true,
          opacity: 0,
          blending: BLEND,
          depthWrite: false,
          color: new Color(tint.comet.r * 1.2, tint.comet.g * 1.2, tint.comet.b * 1.2),
        }),
      );
      const head = new Sprite(headMat);
      head.scale.set(0.35, 0.35, 1);

      group.add(line);
      group.add(head);

      const home = strands[Math.floor(Math.random() * strands.length)];
      const speed = c.cometSpeed * (0.7 + Math.random() * 0.6);
      cometList.push({
        bright: 0.7 + Math.random() * 0.3,
        lane: home.lane,
        speed,
        pulse: home.speed,
        wobblePhase: home.wobblePhase,
        base: speed,
        boost: 0,
        boostMul: 1,
        racing: false,
        s: 0,
        idle: 0,
        idleFor: 0.4 + (i / cometTotal) * c.cometDelay,
        trail,
        trailCol,
        geo,
        line,
        head,
      });
    }

    born = 0;
    resize();
  }

  const distance = FORM_HEIGHT / 2 / Math.tan((BASE_ZOOM * Math.PI) / 180 / 2);
  const viewDir = new Vector3(3.4, -0.6, 10).normalize();
  const lookTarget = new Vector3(0, FORM_HEIGHT / 2, 0);
  camera.position.copy(lookTarget).addScaledVector(viewDir, distance);
  camera.lookAt(lookTarget);

  let viewHeight = 1;

  function resize() {
    const c = cfg;
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    viewHeight = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    repelUniforms.uAspect.value = w / h;
    repelUniforms.uRadius.value = clamp(c.repelRadius / (h / 2), 0.01, 3);
    if (!c.running) renderer.render(scene, camera);
  }
  const observer = new ResizeObserver(resize);

  let repelTarget = 0;
  const onPointerMove = (e) => {
    const c = cfg;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    repelUniforms.uMouse.value.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -(((e.clientY - rect.top) / rect.height) * 2 - 1),
    );
    repelTarget = c.hoverRepel && c.running ? clamp(c.repelStrength / 100, 0, 1) * REPEL_MAX_NDC : 0;
  };
  const onPointerLeave = () => {
    repelTarget = 0;
  };
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerleave', onPointerLeave);
  container.addEventListener('pointercancel', onPointerLeave);

  function addWave(x, y, z, at, amp) {
    wavesAwake = true;
    let slot = 0;
    let oldest = Infinity;
    for (let i = 0; i < MAX_WAVES; i++) {
      if (!waves[i].active) {
        slot = i;
        break;
      }
      if (waves[i].at < oldest) {
        oldest = waves[i].at;
        slot = i;
      }
    }
    waves[slot] = { active: true, x, y, z, at, amp };
  }

  function waveAt(x, y, z, now, out, at, radius) {
    let ox = 0;
    let oy = 0;
    let oz = 0;
    let any = false;
    for (let i = 0; i < MAX_WAVES; i++) {
      const w = waves[i];
      if (!w.active) continue;
      const age = now - w.at;
      if (age > WAVE_LIFE) {
        w.active = false;
        continue;
      }
      any = true;
      const dx = x - w.x;
      const dy = y - w.y;
      const dz = z - w.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < 0.001 || d > radius * 1.5) continue;
      const front = Math.abs(d - WAVE_SPEED * age);
      if (front > WAVE_WIDTH) continue;
      const shell = Math.cos(((front / WAVE_WIDTH) * Math.PI) / 2);
      const fade = Math.exp(-age / WAVE_DECAY);
      const near = 1 / Math.max(d, 0.3);
      const push = RIPPLE_STRENGTH * w.amp * WAVE_STRENGTH * shell * fade * near;
      ox += (dx / d) * push;
      oy += (dy / d) * push;
      oz += (dz / d) * push;
    }
    if (!any) wavesAwake = false;
    out[at] += ox;
    out[at + 1] += oy;
    out[at + 2] += oz;
  }

  function burstAt(i, now, force) {
    rippleAwake = true;
    const x = dotHome[i * 3];
    const y = dotHome[i * 3 + 1];
    const z = dotHome[i * 3 + 2];
    addWave(x, y, z, now, force);
    const radius = RIPPLE_RADIUS;
    const maxSq = radius * radius;
    for (let j = 0; j < dotCount; j++) {
      const dx = dotHome[j * 3] - x;
      const dy = dotHome[j * 3 + 1] - y;
      const dz = dotHome[j * 3 + 2] - z;
      const sq = dx * dx + dy * dy + dz * dz;
      if (sq > maxSq || sq < 1e-4) continue;
      const d = Math.sqrt(sq);
      const f = 1 - d / radius;
      const push = (RIPPLE_STRENGTH * force * f * f) / Math.max(d, 0.1);
      dotVel[j * 3] += dx * push;
      dotVel[j * 3 + 1] += dy * push;
      dotVel[j * 3 + 2] += dz * push;
      const swell = 1 + (SCALE_PEAK - 1) * force * f * f;
      if (swell > dotScale[j]) {
        dotScale[j] = swell;
        dotScaleVel[j] = 0;
      }
    }
  }

  function settle(dt) {
    let moving = false;
    for (let i = 0; i < dotCount; i++) {
      const at = i * 3;
      for (let k = 0; k < 3; k++) {
        const a = -RIPPLE_SPRING * dotShift[at + k] - RIPPLE_DAMPING * dotVel[at + k];
        dotVel[at + k] += a * dt;
        dotShift[at + k] += dotVel[at + k] * dt;
      }
      const restSq = dotShift[at] ** 2 + dotShift[at + 1] ** 2 + dotShift[at + 2] ** 2;
      const velSq = dotVel[at] ** 2 + dotVel[at + 1] ** 2 + dotVel[at + 2] ** 2;
      if (restSq < 1e-8 && velSq < 1e-8) {
        dotShift[at] = dotShift[at + 1] = dotShift[at + 2] = 0;
        dotVel[at] = dotVel[at + 1] = dotVel[at + 2] = 0;
      } else {
        moving = true;
      }
      const sa = -SCALE_SPRING * (dotScale[i] - 1) - SCALE_DAMPING * dotScaleVel[i];
      dotScaleVel[i] += sa * dt;
      dotScale[i] += dotScaleVel[i] * dt;
      if (Math.abs(dotScale[i] - 1) < 0.001 && Math.abs(dotScaleVel[i]) < 0.001) {
        dotScale[i] = 1;
        dotScaleVel[i] = 0;
      } else {
        moving = true;
      }
    }
    if (!moving) rippleAwake = false;
  }

  let frame = 0;
  let born = 0;
  let elapsed = 0;
  let flow = 0;
  let strandClock = 0;
  let heldFrame = false;
  let tick = 0;
  let pulseFlash = 0; // pico del halo al dispararse un golpe de partículas
  let lastTime = performance.now();

  function drawStrand(strand, now, entrance) {
    const c = cfg;
    const e = scroll.energy || 0;
    const spin = flow * strand.speed;
    const bright = strand.bright * c.lineGlow;
    const lift = 0.15 + bright * 1.5 + e * 0.9;
    const alpha =
      Math.min(bright * 0.5 * (0.9 + 0.1 * Math.sin(now * 0.18 + strand.pulse)) * (1 + e * 0.35), 0.7) *
      Math.min(entrance * 3, 1);
    const reach = strand.from + entrance * (strand.to - strand.from);
    const tipFade = 0.15 * (strand.to - strand.from);
    const { pts, cols } = strand;

    for (let i = 0; i < STRAND_SEGMENTS; i++) {
      const u = i / (STRAND_SEGMENTS - 1);
      const s = strand.from + u * (strand.to - strand.from);
      const at = i * 3;
      shape.writePoint(pts, at, s, strand.lane, spin, WOBBLE, strand.wobblePhase, now);
      if (wavesAwake) waveAt(pts[at], pts[at + 1], pts[at + 2], now, pts, at, RIPPLE_RADIUS);
      let edge = 1;
      if (u < FADE_ZONE) {
        const k = u / FADE_ZONE;
        edge = k * k;
      } else if (u > 1 - FADE_ZONE) {
        const k = (1 - u) / FADE_ZONE;
        edge = k * k;
      }
      let tip = 1;
      if (s > reach) tip = 0;
      else if (s > reach - tipFade) {
        tip = (reach - s) / tipFade;
        tip *= tip;
      }
      const v = edge * lift * tip * alpha;
      // lerp(piso, tint, v): con piso negro (aditivo) esto es idéntico a
      // tint*v de siempre; con piso claro (normal) funde hacia el fondo
      // real en vez de hacia negro. Ver comentario de `base` más arriba.
      cols[at] = base.strand.r + (tint.strand.r - base.strand.r) * v;
      cols[at + 1] = base.strand.g + (tint.strand.g - base.strand.g) * v;
      cols[at + 2] = base.strand.b + (tint.strand.b - base.strand.b) * v;
    }

    let w = strand.offset;
    for (let i = 0; i < STRAND_SEGMENTS - 1; i++) {
      const a = i * 3;
      const b = (i + 1) * 3;
      strandPos[w] = pts[a];
      strandPos[w + 1] = pts[a + 1];
      strandPos[w + 2] = pts[a + 2];
      strandCol[w] = cols[a];
      strandCol[w + 1] = cols[a + 1];
      strandCol[w + 2] = cols[a + 2];
      w += 3;
      strandPos[w] = pts[b];
      strandPos[w + 1] = pts[b + 1];
      strandPos[w + 2] = pts[b + 2];
      strandCol[w] = cols[b];
      strandCol[w + 1] = cols[b + 1];
      strandCol[w + 2] = cols[b + 2];
      w += 3;
    }
  }

  function driveComet(comet, now, dt, entrance) {
    const c = cfg;
    const e = scroll.energy || 0;
    const tailLen = comet.trail.length / 3;

    // Dirección del recorrido: sigue al scroll (momentum) cuando el gesto es
    // claro; si no hay scroll, usa la dirección base configurada (flowDir).
    const m = scroll.momentum || 0;
    const cometDir = Math.abs(m) > 0.15 ? (m > 0 ? 1 : -1) : c.flowDir;

    if (!comet.racing) {
      comet.head.material.opacity = 0;
      if (entrance < 0.3) return;
      comet.idle += dt * (1 + e * 2.5); // el scroll acelera el lanzamiento
      if (comet.idle > comet.idleFor) {
        comet.racing = true;
        comet.s = cometDir < 0 ? RUN_HIGH : RUN_LOW;
        comet.base = c.cometSpeed * (0.7 + Math.random() * 0.6);
        comet.speed = comet.base;
        comet.boost = 0;
        comet.boostMul = 1;
        const home = strands[Math.floor(Math.random() * strands.length)];
        comet.lane = home.lane;
        comet.pulse = home.speed;
        comet.wobblePhase = home.wobblePhase;
      }
      return;
    }

    if (comet.boost > 0) {
      comet.boost -= dt;
      if (comet.boost <= 0) {
        comet.boost = 0;
        comet.boostMul = 1;
      } else {
        comet.boostMul = 1 + (HIT_BOOST - 1) * (comet.boost / HIT_BOOST_TIME);
      }
      comet.speed = comet.base * comet.boostMul;
    }

    // Al invertir el gesto, cometDir cambia de signo y el cometa da la vuelta.
    comet.s += dt * comet.speed * cometDir * (1 + e * 1.2);
    if (cometDir < 0 ? comet.s < RUN_LOW : comet.s > RUN_HIGH) {
      comet.racing = false;
      comet.idle = 0;
      comet.idleFor = c.cometDelay * (0.6 + Math.random() * 0.8);
      comet.trailCol.fill(0);
      comet.geo.attributes.color.needsUpdate = true;
      comet.head.material.opacity = 0;
      return;
    }

    const spin = flow * comet.pulse;
    const ends = clamp((comet.s - RUN_LOW) / RUN_FADE, 0, 1) * clamp((RUN_HIGH - comet.s) / RUN_FADE, 0, 1);

    for (let i = 0; i < tailLen; i++) {
      const s = clamp(comet.s - i * 0.005 * cometDir, 0.005, 0.995);
      const at = i * 3;
      shape.writePoint(comet.trail, at, s, comet.lane, spin, WOBBLE, comet.wobblePhase, now);
      const along = (1 - i / tailLen) ** 2;
      const v = comet.bright * c.cometGlow * along * ends;
      const hot = entrance * (i < 3 ? 1.3 : 1);
      comet.trailCol[at] = tint.comet.r * v * hot;
      comet.trailCol[at + 1] = tint.comet.g * v * hot;
      comet.trailCol[at + 2] = tint.comet.b * v * hot;
    }

    comet.head.position.set(comet.trail[0], comet.trail[1], comet.trail[2]);
    const swell = comet.boost > 0 ? 1 + (comet.boostMul - 1) * 0.8 : 1;
    comet.head.material.opacity = ends * 0.35 * entrance * swell;
    comet.head.scale.set(0.35 * swell, 0.35 * swell, 1);
    comet.geo.attributes.position.needsUpdate = true;
    comet.geo.attributes.color.needsUpdate = true;
  }

  function collide(now) {
    const c = cfg;
    const force = c.collideForce;
    if (force <= 0) return;
    const hitSq = HIT_RADIUS * HIT_RADIUS;
    for (const comet of cometList) {
      if (!comet.racing) continue;
      const x = comet.trail[0];
      const y = comet.trail[1];
      const z = comet.trail[2];
      if (x === 0 && y === 0 && z === 0) continue;
      for (let i = 0; i < dotCount; i += 3) {
        const dx = dotHome[i * 3] - x;
        const dy = dotHome[i * 3 + 1] - y;
        const dz = dotHome[i * 3 + 2] - z;
        const sq = dx * dx + dy * dy + dz * dz;
        if (sq < hitSq && dotHitAt[i] === 0) {
          dotHitAt[i] = 0.001;
          dotFlash[i] = HIT_FLASH * force;
          dotScale[i] = 1 + (HIT_POP - 1) * force;
          burstAt(i, now, force);
          comet.boost = HIT_BOOST_TIME;
          comet.boostMul = 1 + (HIT_BOOST - 1) * force;
          comet.speed = comet.base * comet.boostMul;
        }
      }
    }
  }

  function step(now) {
    frame = requestAnimationFrame(step);
    const c = cfg;
    const dt = Math.min((now - lastTime) / 1000, 0.04);
    lastTime = now;

    if (!c.running) {
      if (!heldFrame) {
        renderer.render(scene, camera);
        heldFrame = true;
      }
      return;
    }
    heldFrame = false;

    if (born === 0) born = now;
    elapsed = (now - born) / 1000;
    const t = elapsed;

    const fadeStrand = ramp(t, ENTRANCE.strandStart, ENTRANCE.strandEnd);
    const fadeDot = ramp(t, ENTRANCE.dotStart, ENTRANCE.dotEnd);
    const fadeComet = ramp(t, ENTRANCE.cometStart, ENTRANCE.cometEnd);

    syncColors(c);

    // La energía y el momentum decaen solos cada frame (aunque no lleguen más
    // eventos de scroll): el tornado siempre retorna a su estado base al parar.
    if (scroll.energy > 0) scroll.energy = Math.max(0, scroll.energy - dt * 1.6);
    if (scroll.momentum) {
      scroll.momentum = Math.abs(scroll.momentum) < 0.02 ? 0 : scroll.momentum * (1 - Math.min(1, dt * 2.5));
    }

    // Reacción al scroll: la energía del gesto acelera el giro, enciende las
    // partículas y acerca la cámara al vórtice.
    const e = scroll.energy || 0;
    const fov = fovForZoom(c.zoom + e * 14);
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    repelUniforms.uRadius.value = clamp(c.repelRadius / (viewHeight / 2), 0.01, 3);

    flow += dt * c.flowSpeed * (1 + e * 2.4);
    const us = repelUniforms.uStrength;
    us.value += (repelTarget - us.value) * Math.min(1, dt * 12);

    strandClock += dt;
    // Con energía de scroll, los hilos se actualizan más a menudo (más vida).
    if (strandClock >= STRAND_HZ / (1 + e * 2) && strandGeo) {
      strandClock -= STRAND_HZ;
      for (const strand of strands) drawStrand(strand, t, fadeStrand);
      strandGeo.attributes.position.needsUpdate = true;
      strandGeo.attributes.color.needsUpdate = true;
    }

    if (rippleAwake) settle(dt);

    if (dotMesh && dotCount > 0) {
      const size = c.dotSize;
      for (let i = 0; i < dotCount; i++) {
        const dot = dotList[i];
        const strand = strands[dot.strand] ?? strands[0];
        const spin = flow * strand.speed;
        const at = i * 3;
        shape.writePoint(dotHome, at, dot.s, dot.lane, spin, WOBBLE, strand.wobblePhase, t);

        if (dotHitAt[i] > 0) {
          dotHitAt[i] += dt;
          const age = dotHitAt[i];
          if (age < HIT_FADE) {
            const k = age / HIT_FADE;
            dotAlive[i] = (1 + (HIT_POP - 1) * (1 - k)) * (1 - k * k);
            dotFlash[i] = HIT_FLASH * (1 - k * k) * (1 - k * k);
          } else {
            dotAlive[i] = 0;
            dotFlash[i] = 0;
          }
          if (age > HIT_RESPAWN) {
            dotHitAt[i] = 0;
            dotAlive[i] = 1;
            dotFlash[i] = 0;
          }
        }

        const alive = dotAlive[i];
        const scale = size * dotScale[i] * alive * (1 + e * 0.15);
        dummyPos.set(
          dotHome[at] + dotShift[at],
          dotHome[at + 1] + dotShift[at + 1],
          dotHome[at + 2] + dotShift[at + 2],
        );
        dummyScale.set(scale, scale, scale);
        dummy.compose(dummyPos, camera.quaternion, dummyScale);
        dotMesh.setMatrixAt(i, dummy);

        const beat =
          1 -
          c.dotFlicker +
          c.dotFlicker * (0.08 + 0.92 * Math.max(0, Math.sin(t * dot.flickerRate + dot.pulse)) ** 2.5);
        const swollen = dotScale[i] > 1.02 ? 1 + (dotScale[i] - 1) * 0.5 : 1;
        const v =
          dot.bright * beat * c.dotGlow * swollen * fadeDot * (1 + dotFlash[i]) * alive * (1 + e * 0.5);
        dotColors[at] = base.dot.r + (tint.dot.r - base.dot.r) * v;
        dotColors[at + 1] = base.dot.g + (tint.dot.g - base.dot.g) * v;
        dotColors[at + 2] = base.dot.b + (tint.dot.b - base.dot.b) * v;
      }
      dotMesh.instanceMatrix.needsUpdate = true;
      if (dotMesh.instanceColor) dotMesh.instanceColor.needsUpdate = true;
      dotMesh.material.opacity = 0.9 * fadeDot;
    }

    for (const comet of cometList) driveComet(comet, t, dt, fadeComet);
    tick++;
    if (tick % 2 === 0 && dotCount > 0) collide(t);

    // El halo de energía se apaga solo tras un golpe (decae igual que la energía).
    if (pulseFlash > 0) pulseFlash = Math.max(0, pulseFlash - dt * 3);
    if (onFrame) onFrame({ energy: e, flash: pulseFlash });

    renderer.render(scene, camera);
  }

  build();
  observer.observe(container);
  lastTime = performance.now();
  frame = requestAnimationFrame(step);

  // Golpe de partículas inducido desde fuera (scroll rápido): unas pocas dots
  // estallan y lanzan ondas, como un impacto del cometa.
  function pulse() {
    const c = cfg;
    if (!c.running || dotCount === 0) return;
    const force = 0.4 + Math.random() * 0.6;
    const now = elapsed;
    for (let k = 0; k < 4; k++) {
      const i = (Math.random() * dotCount) | 0;
      if (dotHitAt[i] > 0) continue;
      dotHitAt[i] = 0.001;
      dotFlash[i] = HIT_FLASH * force * 0.7;
      if (1 + (HIT_POP - 1) * force * 0.8 > dotScale[i]) {
        dotScale[i] = 1 + (HIT_POP - 1) * force * 0.8;
        dotScaleVel[i] = 0;
      }
      burstAt(i, now, force);
    }
    pulseFlash = 1; // el halo destella con el golpe
    // Pulso global (opcional, prop pulseEvent): propaga el golpe a la página
    // para que la atmósfera (atmosphere.js) destelle los orbes al unísono.
    if (c.pulseEvent) {
      window.dispatchEvent(new CustomEvent('vortex:pulse', { detail: { strength: force } }));
    }
  }

  return {
    pulse,
    rebuild: build,
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('pointercancel', onPointerLeave);
      for (const d of disposables) d.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
    },
  };
}

/* ============================================================ component */

/**
 * Monta un tornado de partículas dentro de `container` (crea su propio canvas).
 * Devuelve { setProps, pulse, dispose } o lanza si WebGL no está disponible.
 */
export function createVortex(container, props = {}) {
  if (!container) throw new Error('[vortex] missing container');
  if (typeof WebGLRenderingContext === 'undefined') throw new Error('[vortex] WebGL unavailable');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // `options` es mutable: setProps lo va fusionando de forma acumulativa.
  let options = mergeProps(props);
  const config = buildConfig(options, reduced);
  const scroll = { energy: 0, momentum: 0 };

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  container.appendChild(canvas);

  let halo = null;

  try {
    // El halo y la reacción al scroll son opcionales (props halo / scrollReaction).
    if (options.halo !== false) halo = buildHalo(container);
    const api = createVortexEngine(canvas, container, config, scroll, halo ? halo.sync : undefined);
    const scrollApi =
      options.scrollReaction !== false && !reduced ? initScrollReaction(container, scroll, api) : null;

    return {
      /**
       * Fusiona props parciales de forma acumulativa (un { color } no borra el
       * count/glow previos) y reconstruye el motor. Nota: la reconstrucción
       * reinicia la animación de entrada del tornado (~2s). `halo`,
       * `scrollReaction` y `pulseEvent` son solo de creación.
       */
      setProps(partial = {}) {
        options = mergeProps(partial, options);
        Object.assign(config, buildConfig(options, reduced));
        api.rebuild();
      },
      /** Golpe de partículas: estallido + ondas + destello del halo + evento global. */
      pulse() {
        api.pulse();
      },
      /** Libera el contexto WebGL, listeners, canvas y halo. */
      dispose() {
        scrollApi?.dispose();
        api.dispose();
        canvas.remove();
        halo?.el.remove();
      },
    };
  } catch (err) {
    // WebGL unavailable / context limit — degrade to a clean container.
    canvas.remove();
    halo?.el.remove();
    throw err;
  }
}
