// ─── Fondo cinematográfico del carousel + parallax de mouse ───
// Composición 100% CSS/SVG (sin fotos externas): dos capas que cruzan en
// crossfade al cambiar de nivel, cada una con gradientes propios de la
// etapa (docker/compose/k8s) y una forma SVG decorativa temática (cajas
// apiladas, enlaces de servicios, nodos de cluster).
import { gsap } from 'gsap';

const THEME = {
  docker: { a: 'var(--docker-blue)', b: 'var(--accent)', shape: 'boxes' },
  compose: { a: 'var(--compose-orange)', b: 'var(--accent-2)', shape: 'links' },
  k8s: { a: 'var(--k8s-blue)', b: 'var(--k8s-light)', shape: 'nodes' },
};

function shapeSvg(kind) {
  if (kind === 'boxes') {
    return `<svg viewBox="0 0 200 200" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.55">
        <rect x="46" y="96" width="46" height="46" rx="4"/>
        <rect x="98" y="96" width="46" height="46" rx="4"/>
        <rect x="72" y="46" width="46" height="46" rx="4"/>
      </g>
    </svg>`;
  }
  if (kind === 'links') {
    return `<svg viewBox="0 0 200 200" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.55">
        <rect x="30" y="70" width="40" height="40" rx="8"/>
        <rect x="130" y="70" width="40" height="40" rx="8"/>
        <rect x="80" y="130" width="40" height="40" rx="8"/>
        <path d="M70 90 H130 M52 110 V130 M148 110 V130 M100 130 V110"/>
      </g>
    </svg>`;
  }
  return `<svg viewBox="0 0 200 200" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.55">
      <circle cx="100" cy="60" r="14"/>
      <circle cx="55" cy="140" r="14"/>
      <circle cx="145" cy="140" r="14"/>
      <path d="M100 74 L55 126 M100 74 L145 126 M69 140 H131"/>
    </g>
  </svg>`;
}

/**
 * @param {HTMLElement} root contenedor `.course-exp__bg` (dos hijos layer A/B)
 * @param {HTMLElement} decor contenedor `.course-exp__decor` (formas flotantes)
 */
export function createBackground(root, decor) {
  const layers = [document.createElement('div'), document.createElement('div')];
  layers.forEach((l, i) => {
    l.className = 'course-exp__bg-layer';
    l.style.opacity = i === 0 ? '1' : '0';
    root.appendChild(l);
  });
  let front = 0;
  let currentEtapa = null;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function paint(layer, nivel) {
    const theme = THEME[nivel.etapa] ?? THEME.docker;
    layer.style.setProperty('--course-a', theme.a);
    layer.style.setProperty('--course-b', theme.b);
    layer.innerHTML = `<div class="course-exp__bg-glow course-exp__bg-glow--1"></div>
      <div class="course-exp__bg-glow course-exp__bg-glow--2"></div>
      <div class="course-exp__bg-shape">${shapeSvg(theme.shape)}</div>`;
  }

  /** Pinta el fondo del nivel dado. Crossfade si cambia de etapa. */
  function setLevel(nivel, animate = true) {
    const changed = nivel.etapa !== currentEtapa;
    currentEtapa = nivel.etapa;
    const back = 1 - front;
    paint(layers[back], nivel);

    if (!changed) {
      // Mismo tema: solo un leve desplazamiento del layer visible, sin corte.
      if (animate && !reduced) {
        gsap.fromTo(layers[front], { x: 6 }, { x: 0, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
      }
      return;
    }

    if (!animate || reduced) {
      layers[back].style.opacity = '1';
      layers[front].style.opacity = '0';
      front = back;
      return;
    }

    gsap.killTweensOf(layers);
    gsap.set(layers[back], { opacity: 0, x: 18 });
    const tl = gsap.timeline();
    tl.to(layers[back], { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out' }, 0);
    tl.to(layers[front], { opacity: 0, x: -12, duration: 0.9, ease: 'power2.out' }, 0);
    front = back;
  }

  // ── Parallax de mouse: fondo se mueve poco, decorativos un poco más ──
  const quickBg = gsap.quickTo(root, 'x', { duration: 0.6, ease: 'power3.out' });
  const quickBgY = gsap.quickTo(root, 'y', { duration: 0.6, ease: 'power3.out' });
  const quickDecor = decor ? gsap.quickTo(decor, 'x', { duration: 0.5, ease: 'power3.out' }) : null;
  const quickDecorY = decor ? gsap.quickTo(decor, 'y', { duration: 0.5, ease: 'power3.out' }) : null;

  /** nx, ny en [-1, 1] relativo al centro del stage. */
  function applyParallax(nx, ny) {
    if (reduced) return;
    quickBg(nx * 10);
    quickBgY(ny * 8);
    quickDecor?.(nx * 22);
    quickDecorY?.(ny * 16);
  }

  function resetParallax() {
    if (reduced) return;
    quickBg(0);
    quickBgY(0);
    quickDecor?.(0);
    quickDecorY?.(0);
  }

  return { setLevel, applyParallax, resetParallax };
}
