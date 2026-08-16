// ─── Partículas ambientales y orbes de glow por sección ───
// 1. Partículas ambientales: polvo de luz fijo que deriva y pulsa en toda la
//    página, con parallax propio (capa "cercana").
// 2. Orbes de glow por sección: glows de color según la identidad de cada
//    bloque (cian, índigo, azul Docker, naranja Compose…), con parallax por
//    `depth`, reacción al hover de las tarjetas, y un pulso global disparado
//    por el vórtice WebGL del hero (evento `vortex:pulse`).
// Todo respeta `prefers-reduced-motion: reduce`.
import { gsap } from 'gsap';
import { reducedMotion } from './shared.js';

/* Colores de los orbes por sección: rgb triplets del sistema de diseño.
   Opacidades tenues: fondo sobrio, el contenido es el protagonista. */
const SECTION_GLOWS = {
  objectives: [
    { left: '5%', top: '14%', size: 360, color: '34,211,238', opacity: 0.1, depth: 1.3 },
    { right: '6%', top: '26%', size: 400, color: '138,162,255', opacity: 0.11, depth: 0.8 },
  ],
  method: [
    { left: '8%', top: '24%', size: 460, color: '34,31,114', opacity: 0.38, depth: 1.1 },
    { right: '7%', top: '34%', size: 360, color: '56,189,248', opacity: 0.09, depth: 1.5 },
    { left: '38%', top: '6%', size: 300, color: '30,158,247', opacity: 0.07, depth: 0.7 },
  ],
  etapas: [
    { left: '9%', top: '18%', size: 360, color: '30,158,247', opacity: 0.08, depth: 1.2 },
    { right: '8%', top: '30%', size: 320, color: '249,115,22', opacity: 0.07, depth: 0.8 },
    { left: '42%', bottom: '0', size: 500, color: '34,31,114', opacity: 0.36, depth: 1.6 },
  ],
  niveles: [
    { left: '5%', top: '12%', size: 380, color: '56,189,248', opacity: 0.08, depth: 1.2 },
    { right: '4%', top: '24%', size: 440, color: '138,162,255', opacity: 0.1, depth: 1.5 },
  ],
  proyecto: [
    { left: '9%', top: '22%', size: 460, color: '34,31,114', opacity: 0.38, depth: 1.2 },
    { right: '7%', top: '10%', size: 340, color: '56,189,248', opacity: 0.09, depth: 0.8 },
    { left: '28%', bottom: '2%', size: 400, color: '74,124,247', opacity: 0.07, depth: 1.7 },
  ],
  herramientas: [
    { left: '7%', top: '28%', size: 400, color: '30,158,247', opacity: 0.08, depth: 1.3 },
    { right: '6%', top: '14%', size: 340, color: '34,211,238', opacity: 0.08, depth: 0.7 },
  ],
  ruta: [
    { left: '11%', top: '18%', size: 440, color: '34,31,114', opacity: 0.36, depth: 1.0 },
    { right: '10%', top: '38%', size: 360, color: '56,189,248', opacity: 0.09, depth: 1.5 },
    { left: '22%', bottom: '8%', size: 300, color: '249,115,22', opacity: 0.05, depth: 0.6 },
  ],
  cta: [
    { left: '14%', top: '26%', size: 400, color: '34,211,238', opacity: 0.1, depth: 1.2 },
    { right: '12%', top: '20%', size: 440, color: '34,31,114', opacity: 0.36, depth: 0.9 },
  ],

  // Página de nivel: columna de contenido (nivel.html, .nivel-main)
  'nivel-content': [
    { left: '2%', top: '8%', size: 400, color: '34,31,114', opacity: 0.36, depth: 1.2 },
    { right: '2%', top: '34%', size: 360, color: '56,189,248', opacity: 0.08, depth: 1.5 },
    { left: '12%', top: '60%', size: 340, color: '30,158,247', opacity: 0.06, depth: 1.1 },
    { left: '24%', bottom: '4%', size: 440, color: '138,162,255', opacity: 0.09, depth: 0.9 },
  ],
};

/* Tarjetas de cada sección que encienden los orbes al pasar el cursor. */
const SECTION_HOVER = {
  objectives: '.objectives__grid li',
  method: '.method__step',
  etapas: '.etapa-tab, .level-chip',
  niveles: '.nivel-card',
  proyecto: '.arch-box, .proyecto__layer',
  herramientas: '.tool-group, .tool-tag',
  ruta: '.ruta__item',
  cta: '.cta-final .btn',
  'nivel-content':
    '.code-block, .block--problem, .block--analogy, .lab-block, .diagram-block, .items-list__item, .comparison-table-wrap',
};

/* Paleta de las partículas: mayormente cian del acento, algo de índigo y blanco. */
const PARTICLE_COLORS = ['34,211,238', '34,211,238', '34,211,238', '138,162,255', '255,255,255'];

/* ─── 1) Partículas ambientales ─── */
export function buildParticles(layer) {
  const count = window.innerWidth < 768 ? 18 : 40;
  const frag = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    const size = (1.2 + Math.random() * 2.4).toFixed(1);
    const drift = 30 + Math.random() * 70;

    p.style.left = `${(Math.random() * 100).toFixed(2)}%`;
    p.style.top = `${(Math.random() * 100).toFixed(2)}%`;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.setProperty('--pc', PARTICLE_COLORS[(Math.random() * PARTICLE_COLORS.length) | 0]);
    p.style.setProperty('--op', (0.1 + Math.random() * 0.26).toFixed(2));
    p.style.setProperty('--dur', `${(12 + Math.random() * 16).toFixed(1)}s`);
    p.style.setProperty('--delay', `${(-Math.random() * 22).toFixed(1)}s`);
    p.style.setProperty('--tx', `${((Math.random() * 2 - 1) * drift).toFixed(0)}px`);
    p.style.setProperty('--ty', `${((Math.random() * 2 - 1) * drift * 0.6).toFixed(0)}px`);
    frag.appendChild(p);
  }

  layer.appendChild(frag);
}

/* ─── 2) Orbes de glow por sección + su parallax ───
   En móvil se reducen tamaño y cantidad para mantener el coste bajo. */
export function buildSectionGlows() {
  const isMobile = window.innerWidth < 768;
  const maxOrbs = isMobile ? 2 : Infinity;
  const sizeScale = isMobile ? 0.72 : 1;

  document.querySelectorAll('[data-glows]').forEach((section) => {
    const configs = SECTION_GLOWS[section.dataset.glows];
    if (!configs) return;

    const layer = document.createElement('div');
    layer.className = 'section-glow';
    layer.setAttribute('aria-hidden', 'true');

    configs.slice(0, maxOrbs).forEach((cfg) => {
      const orb = document.createElement('i');
      const style = orb.style;
      const size = Math.round(cfg.size * sizeScale);
      style.width = `${size}px`;
      style.height = `${size}px`;
      style.left = cfg.left ?? 'auto';
      style.right = cfg.right ?? 'auto';
      style.top = cfg.top ?? 'auto';
      style.bottom = cfg.bottom ?? 'auto';
      style.setProperty('--c', cfg.color);
      style.setProperty('--o', cfg.opacity);
      layer.appendChild(orb);
    });

    section.appendChild(layer);

    // Parallax de profundidad: cada orbe se desplaza a una velocidad distinta
    if (!reducedMotion()) {
      [...layer.children].forEach((orb, i) => {
        const depth = configs[i].depth || 1;
        const dir = i % 2 === 0 ? 1 : -1;
        const dist = depth * 55;
        gsap.fromTo(
          orb,
          { y: -dir * dist },
          {
            y: dir * dist,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.1 },
          },
        );
      });
    }
  });
}

/* ─── 2b) Reacción al hover: las tarjetas encienden los orbes de su sección ───
   Al pasar el cursor sobre una tarjeta, el orbe más cercano se intensifica,
   crece y deriva hacia ella; el resto de orbes de la sección se aviva. Al
   salir, todo vuelve a su intensidad base. Delegación en la sección para
   cubrir contenido generado (nivel-cards, chips, bloques del nivel). */
export function initHoverReaction() {
  if (reducedMotion()) return;

  document.querySelectorAll('[data-glows]').forEach((section) => {
    const sel = SECTION_HOVER[section.dataset.glows];
    const orbs = section.querySelectorAll('.section-glow i');
    if (!sel || !orbs.length) return;

    const secRect = section.getBoundingClientRect();
    const perOrb = [...orbs].map((orb) => {
      const r = orb.getBoundingClientRect();
      return {
        orb,
        baseO: parseFloat(orb.style.getPropertyValue('--o')) || 0.1,
        cxBase: r.left + r.width / 2 - secRect.left,
        cyBase: r.top + r.height / 2 - secRect.top,
      };
    });

    let current = null;

    const enter = (card) => {
      const cardRect = card.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const cx = cardRect.left + cardRect.width / 2 - sectionRect.left;
      const cy = cardRect.top + cardRect.height / 2 - sectionRect.top;

      // Orbe más cercano al centro de la tarjeta, usando su posición REAL
      // (incluye el desplazamiento del parallax al hacer hover a mitad de scroll).
      let best = null;
      let bestD = Infinity;
      for (const p of perOrb) {
        const r = p.orb.getBoundingClientRect();
        const ox = r.left + r.width / 2 - sectionRect.left;
        const oy = r.top + r.height / 2 - sectionRect.top;
        const d = (ox - cx) ** 2 + (oy - cy) ** 2;
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }

      for (const p of perOrb) {
        const to =
          p === best
            ? {
                '--o': Math.min(p.baseO * 2.4, 0.85),
                scale: 1.3,
                x: Math.max(-36, Math.min(36, (cx - p.cxBase) * 0.12)),
              }
            : { '--o': Math.min(p.baseO * 1.35, 0.6) };
        gsap.to(p.orb, { ...to, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
      }
    };

    const leave = () => {
      for (const p of perOrb) {
        gsap.to(p.orb, {
          '--o': p.baseO,
          scale: 1,
          x: 0,
          duration: 0.9,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    };

    section.addEventListener('mouseover', (e) => {
      const card = e.target.closest(sel);
      if (!card || card === current) return;
      current = card;
      enter(card);
    });
    section.addEventListener('mouseout', (e) => {
      if (!current) return;
      const to = e.relatedTarget;
      const inCurrent = to && current.contains(to);
      const cardUnder = to && to.closest ? to.closest(sel) : null;
      const otherCard = cardUnder && cardUnder !== current;
      if (inCurrent || otherCard) return; // el puntero sigue dentro de una tarjeta
      current = null;
      leave();
    });
  });
}

/* ─── 2c) Pulso global ───
   El vórtice WebGL (hero-vortex.js) emite `vortex:pulse` en window cada vez
   que dispara un golpe de partículas (scroll rápido). Aquí se escucha y se
   destellan TODOS los orbes de la página al unísono, con una micro-oleada
   descendente (arriba primero). Se usa el canal --bright (filter brightness),
   separado del hover (que controla --o/scale/x), así no hay colisiones. */
export function initGlobalPulse() {
  if (reducedMotion()) return;

  const orbs = gsap.utils.toArray('.section-glow i');
  if (!orbs.length) return;

  window.addEventListener('vortex:pulse', (e) => {
    const strength = Math.min(1, Math.max(0.4, e.detail?.strength ?? 0.7));
    const peak = 1.35 + strength * 0.55; // ~1.57…1.9 según la fuerza del golpe

    orbs.forEach((orb, i) => {
      // Subida rápida, caída lenta (como la energía del vórtice) y oleada
      // descendente: los orbes superiores (primeros en el DOM) destellan antes.
      // El fromTo a 1 actúa como reset: un pulso que llegue a mitad de caída
      // (throttle 420ms < caída 1.27s) reinicia el destello limpio.
      gsap.fromTo(
        orb,
        { '--bright': 1 },
        {
          '--bright': peak,
          duration: 0.22,
          ease: 'power2.out',
          overwrite: 'auto',
          delay: Math.min(i * 0.008, 0.2),
          onStart() {
            orb.classList.add('pulsing'); // filtro solo durante el destello
          },
          onComplete() {
            gsap.to(orb, {
              '--bright': 1,
              duration: 1.05,
              ease: 'power3.out',
              overwrite: 'auto',
              onComplete() {
                orb.classList.remove('pulsing');
              },
            });
          },
        },
      );
    });
  });
}
