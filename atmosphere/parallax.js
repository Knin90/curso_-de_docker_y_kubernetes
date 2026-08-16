// ─── Parallax global de la atmósfera, arco de la tormenta y descenso del
// vórtice WebGL — las tres capas que dan profundidad a toda la página. ───
import { gsap } from 'gsap';
import { reducedMotion } from './shared.js';

/* ─── 3) Parallax global de la atmósfera ─── */
export function initAtmosphereParallax() {
  if (reducedMotion()) return;

  const atmosphere = document.querySelector('.atmosphere');
  if (atmosphere) {
    // El fondo fijo deriva hacia abajo (retrocede) mientras se hace scroll.
    gsap.to(atmosphere, {
      backgroundPositionY: `+=${window.innerHeight * 0.16}px`,
      ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.2 },
    });

    // OJO DE LA TORMENTA: la pared de la aurora gira con el scroll (más de
    // media vuelta en toda la página), como si uno entrara en espiral al ojo
    // del vórtice al bajar. El sentido es antihorario, opuesto al vórtice
    // WebGL del hero, para dar sensación de "aproximación".
    const eye = atmosphere.querySelector('.atmosphere__eye');
    if (eye) {
      // Misma desaceleración que bandas y embudo: la pared de la aurora gira
      // con energía al inicio y se va frenando al acercarse al ojo.
      gsap.fromTo(
        eye,
        { rotation: -55 },
        {
          rotation: 210,
          ease: 'power4.out',
          scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.4 },
        },
      );
    }
  }

  // Las partículas, capa más "cercana", se mueven en sentido contrario.
  const particles = document.getElementById('atmosphere-particles');
  if (particles && particles.children.length) {
    gsap.fromTo(
      particles,
      { y: window.innerHeight * 0.03 },
      {
        y: -window.innerHeight * 0.03,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.6 },
      },
    );
  }

  // Elementos con data-depth (barras de luz del hero, glows del header de
  // nivel…): parallax anclado al contenedor que recorre el viewport.
  gsap.utils.toArray('[data-depth]').forEach((el) => {
    const depth = parseFloat(el.dataset.depth) || 1;
    const dist = depth * 36;
    gsap.fromTo(
      el,
      { y: -dist },
      {
        y: dist,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.nivel-header, section') || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      },
    );
  });
}

/* ─── 3b) Arco de la tormenta: del huracán al ojo calmo ───
   Recorre TODA la página con el scroll (hero → footer):
   - --storm (intensidad global) cae de 1 (hero) a ~0.12 (footer): las capas
     CSS (bandas, embudo, ráfagas, aurora, partículas) se calman con él.
   - Las bandas de lluvia giran y crecen: se atraviesa la pared del huracán.
   - El embudo se abre e intensifica: uno desciende dentro del vórtice.
   - El halo del ojo (.atmosphere::after) crece y se aviva al entrar en él
     (la calma del CTA/footer). */
export function initStormArc() {
  if (reducedMotion()) return;

  const doc = document.documentElement;
  const page = { trigger: document.body, start: 'top top', end: 'bottom bottom' };

  // Intensidad global de la tormenta: 1 arriba → calma (0.12) en el footer.
  // Se anima un objeto proxy y se escribe el custom property, así GSAP no
  // necesita inferir unidades para variables CSS.
  const stormState = { value: 1 };
  gsap.to(stormState, {
    value: 0.12,
    ease: 'none',
    scrollTrigger: { ...page, scrub: 1 },
    onUpdate: () => doc.style.setProperty('--storm', stormState.value),
  });

  // Bandas de lluvia: giran y se ensanchan mientras uno baja. La easing
  // 'power4.out' concentra el giro en las primeras secciones (rápido y
  // dramático al salir del hero) y lo decelera hacia el ojo, donde casi se
  // detiene: el huracán pierde energía al entrar en el centro calmo.
  const bands = document.querySelector('.atmosphere__bands');
  if (bands) {
    gsap.fromTo(
      bands,
      { xPercent: -50, yPercent: -50, rotation: -30, scale: 1 },
      {
        xPercent: -50,
        yPercent: -50,
        rotation: 78,
        scale: 1.24,
        ease: 'power4.out',
        scrollTrigger: { ...page, scrub: 1.3 },
      },
    );
  }

  // Embudo del vórtice: gira (bamboleo de la tormenta arriba) y se endereza
  // al entrar al ojo; además se abre al descender. La opacidad NO se anima
  // aquí: la gobierna CSS vía --storm, así el embudo se disuelve junto con el
  // resto de la tormenta al entrar en el ojo (arco de calma coherente).
  const funnel = document.querySelector('.atmosphere__funnel');
  if (funnel) {
    gsap.fromTo(
      funnel,
      { xPercent: -50, rotation: 20, scaleY: 0.55 },
      {
        xPercent: -50,
        rotation: 0,
        scaleY: 1.18,
        ease: 'power4.out',
        scrollTrigger: { ...page, scrub: 1.2 },
      },
    );
  }

  // Halo del ojo: crece y se aviva al entrar en el centro calmo.
  const atmosphere = document.querySelector('.atmosphere');
  if (atmosphere) {
    const eyeState = { scale: 0.85, glow: 0.9 };
    gsap.to(eyeState, {
      scale: 1.5,
      glow: 1.25,
      ease: 'none',
      scrollTrigger: { ...page, scrub: 1.2 },
      onUpdate: () => {
        atmosphere.style.setProperty('--eye-scale', eyeState.scale);
        atmosphere.style.setProperty('--eye-glow', eyeState.glow);
      },
    });
  }
}

/* ─── 3c) Descenso del tornado WebGL hacia el footer ───
   El vórtice del hero ahora es un fondo FIJO de toda la página (wrapper
   .hero__vortex-wrap en index.html/style.css). Aquí se le da vida al scroll:
   desciende suavemente (drift) mientras uno baja y se disuelve al llegar al
   ojo calmo del footer, en sincronía con el arco de la tormenta (--storm).
   El wrapper se anima (no el canvas), así el desvanecimiento arrastra también
   al halo de energía (.vortex-energy, hijo del wrapper). */
export function initVortexScroll() {
  if (reducedMotion()) return;

  const wrap = document.getElementById('hero-vortex-wrap');
  if (!wrap) return;

  const page = { trigger: document.body, start: 'top top', end: 'bottom bottom' };

  // Drift: el tornado se hunde lentamente hacia el footer (desplazamiento
  // suave, independiente del desvanecimiento).
  gsap.fromTo(
    wrap,
    { yPercent: 0 },
    {
      yPercent: 7,
      ease: 'none',
      scrollTrigger: { ...page, scrub: 1.4 },
    },
  );

  // Disolución: se mantiene vivo casi toda la página y se apaga al entrar
  // en el ojo calmo (power2.in = fade lento al inicio, rápido al final),
  // igual que --storm llega a ~0.12 en el footer.
  gsap.fromTo(
    wrap,
    { opacity: 1 },
    {
      opacity: 0.12,
      ease: 'power2.in',
      scrollTrigger: { ...page, scrub: 1.4 },
    },
  );
}
