// ─── GSAP + ScrollTrigger: entrada del header, stagger de bloques y pin
// del sidebar en pantallas ≥768px. ───
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initGSAP() {
  const mm = gsap.matchMedia();
  const scope = document.getElementById('nivel-main') || document.body;
  const layout = document.querySelector('.nivel-layout');
  const sidebar = document.getElementById('sidebar');
  const bar = document.querySelector('.nivel-progress__bar');

  // Animaciones de contenido (sin pin)
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const ctx = gsap.context(() => {
      const header = document.getElementById('nivel-header');
      if (header) {
        gsap.fromTo(header, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' });
      }

      // Entrada escalonada del badge, título y objetivo (como el hero del landing)
      gsap.fromTo(
        '.nivel-badge, .nivel-header__title, .nivel-header__objetivo',
        {
          y: 22,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.1,
          delay: 0.2,
          ease: 'power3.out',
          overwrite: 'auto',
        },
      );

      const stack = document.querySelector('.stack3d');
      if (stack) {
        gsap.fromTo(
          stack,
          { opacity: 0, y: 18, scale: 0.85 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, delay: 0.4, ease: 'power3.out' },
        );
      }

      // En modo escenas los módulos se revelan dentro de cada escena
      // (initSceneZoom); estos reveals por scroll no aplican (las secciones
      // viven en el stage fijo y sus posiciones no cambian con el scroll).
      if (!document.body.classList.contains('scenes-mode')) {
        gsap.utils.toArray('.section-block, .block--problem, .block--analogy').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 88%' },
            },
          );
        });

        document.querySelectorAll('.items-list').forEach((list) => {
          gsap.fromTo(
            list.children,
            { y: 14, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: 'power2.out',
              stagger: 0.05,
              scrollTrigger: { trigger: list, start: 'top 87%' },
            },
          );
        });

        document.querySelectorAll('.lab-steps').forEach((steps) => {
          gsap.fromTo(
            steps.children,
            { y: 16, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: 'power2.out',
              stagger: 0.06,
              scrollTrigger: { trigger: steps, start: 'top 87%' },
            },
          );
        });

        document.querySelectorAll('.history-list').forEach((list) => {
          gsap.fromTo(
            list.children,
            { y: 12, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.45,
              ease: 'power2.out',
              stagger: 0.04,
              scrollTrigger: { trigger: list, start: 'top 87%' },
            },
          );
        });

        document.querySelectorAll('.comparison-table').forEach((table) => {
          gsap.fromTo(
            table.querySelectorAll('tbody tr'),
            { opacity: 0, x: -10 },
            {
              opacity: 1,
              x: 0,
              duration: 0.45,
              stagger: 0.04,
              scrollTrigger: { trigger: table.closest('.section-block'), start: 'top 85%' },
            },
          );
        });
      }

      if (bar) {
        gsap.fromTo(
          bar,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 1.1, ease: 'power3.out', delay: 0.5 },
        );
      }
    }, scope);
    return () => ctx.revert();
  });

  // Pin del sidebar en tablet y desktop (≥768px)
  if (sidebar && layout) {
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: layout,
          start: 'top top',
          end: 'bottom bottom',
          pin: sidebar,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
      }, layout);
      return () => ctx.revert();
    });
  }

  requestAnimationFrame(() => ScrollTrigger.refresh());
}
