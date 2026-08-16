// ─── GSAP + ScrollTrigger: motion del landing (hero, secciones, tarjetas) ───
import { gsap } from 'gsap';

export function initLandingMotion() {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const ctx = gsap.context(() => {
      // Entrada del hero (stagger) — solo si estamos arriba del todo
      if (window.scrollY === 0) {
        gsap.fromTo(
          '.hero__badge, .hero__title, .hero__sub, .hero__actions, .hero__ticker',
          {
            y: 34,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            stagger: 0.11,
            delay: 0.2,
          },
        );
      }

      // Títulos y subtítulos de sección
      gsap.utils.toArray('.section-title, .section-sub').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          },
        );
      });

      // Objetivos
      const objGrid = document.querySelector('.objectives__grid');
      if (objGrid) {
        gsap.fromTo(
          objGrid.children,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: { trigger: objGrid, start: 'top 85%' },
          },
        );
      }

      // Metodología: ilustración + pasos + conectores
      const methodFig = document.querySelector('.method__figure');
      if (methodFig) {
        gsap.fromTo(
          methodFig,
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: methodFig, start: 'top 88%' },
          },
        );
      }
      const methodSteps = document.querySelectorAll('.method__step');
      if (methodSteps.length) {
        gsap.fromTo(
          methodSteps,
          { y: 22, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.55,
            stagger: 0.09,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.method__steps', start: 'top 85%' },
          },
        );
      }

      // Etapas: tabs + chips activos
      gsap.fromTo(
        '.etapa-tab',
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.etapa-tabs', start: 'top 87%' },
        },
      );
      const activeChips = document.querySelectorAll('.etapa-content.active .level-chip');
      if (activeChips.length) {
        gsap.fromTo(
          activeChips,
          { y: 12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            stagger: 0.045,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.etapa-content.active', start: 'top 87%' },
          },
        );
      }

      // Tarjetas de nivel (en modo escenas las revela initLandingScenes
      // dentro de cada escena del stage fijo; los reveals por scroll no
      // aplican ahí porque las posiciones no cambian con el scroll).
      if (!document.body.classList.contains('scenes-mode')) {
        const cards = document.querySelectorAll('.nivel-card');
        if (cards.length) {
          gsap.fromTo(
            cards,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.55,
              stagger: 0.05,
              ease: 'power2.out',
              scrollTrigger: { trigger: '.niveles__grid', start: 'top 85%' },
            },
          );
        }
      }

      // Proyecto: banner + arquitectura + capas
      const proyBanner = document.querySelector('.proyecto__banner');
      if (proyBanner) {
        gsap.fromTo(
          proyBanner,
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: proyBanner, start: 'top 88%' },
          },
        );
      }
      const archBoxes = document.querySelectorAll('.proyecto__arch .arch-box, .proyecto__arch .arch-row');
      if (archBoxes.length) {
        gsap.fromTo(
          archBoxes,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.proyecto__arch', start: 'top 85%' },
          },
        );
      }
      const proyLayers = document.querySelectorAll('.proyecto__layer');
      if (proyLayers.length) {
        gsap.fromTo(
          proyLayers,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.09,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.proyecto__layers', start: 'top 88%' },
          },
        );
      }

      // Herramientas
      const toolGroups = document.querySelectorAll('.tool-group');
      if (toolGroups.length) {
        gsap.fromTo(
          toolGroups,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.07,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.tools__grid', start: 'top 85%' },
          },
        );
      }

      // Ruta de aprendizaje (cascada)
      const rutaItems = document.querySelectorAll('.ruta__item');
      const rutaConn = document.querySelectorAll('.ruta__connector');
      if (rutaItems.length) {
        gsap.fromTo(
          rutaItems,
          { x: -20, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.ruta__path', start: 'top 85%' },
          },
        );
        gsap.fromTo(
          rutaConn,
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: 'top center',
            duration: 0.3,
            stagger: 0.06,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.ruta__path', start: 'top 85%' },
          },
        );
      }

      // CTA final
      const cta = document.querySelector('.cta-final .container');
      if (cta) {
        gsap.fromTo(
          cta.children,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.cta-final', start: 'top 85%' },
          },
        );
      }
    });
    return () => ctx.revert();
  });

  // Conectores de la metodología: horizontales en desktop, verticales en móvil
  mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
    const conn = document.querySelectorAll('.method__connector');
    if (!conn.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        conn,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.4,
          stagger: 0.09,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.method__steps', start: 'top 85%' },
        },
      );
    });
    return () => ctx.revert();
  });

  mm.add('(max-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    const conn = document.querySelectorAll('.method__connector');
    if (!conn.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        conn,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          duration: 0.35,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.method__steps', start: 'top 85%' },
        },
      );
    });
    return () => ctx.revert();
  });
}
