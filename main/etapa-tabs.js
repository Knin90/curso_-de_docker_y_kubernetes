// ─── Tabs de etapa (Docker / Compose / Kubernetes) en la sección de niveles ───
import { gsap } from 'gsap';

export function initEtapaTabs() {
  const tabs = document.querySelectorAll('.etapa-tab');
  const contents = document.querySelectorAll('.etapa-content');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.etapa;
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      contents.forEach((c) => {
        c.classList.remove('active');
        c.setAttribute('aria-hidden', 'true');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const content = document.querySelector(`.etapa-content[data-content="${target}"]`);
      content?.classList.add('active');
      content?.setAttribute('aria-hidden', 'false');

      // Micro-animación de los chips al cambiar de etapa
      if (!reduced && content) {
        const chips = content.querySelectorAll('.level-chip');
        gsap.fromTo(
          chips,
          { y: 12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            stagger: 0.04,
            ease: 'power2.out',
            overwrite: 'auto',
          },
        );
      }
    });
  });
}
