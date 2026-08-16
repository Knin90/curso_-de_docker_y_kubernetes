// ─── Piezas chicas de la nav y los tool-tags: logos oficiales, estado
// activo por sección visible, y el botón que baja al listado de niveles. ───
import { brandMarkup, TOOL_ICON_MAP } from '../ticker-logos.js';

// ─── Logos oficiales en los tool-tags ───
export function initToolLogos() {
  document.querySelectorAll('.tool-tag').forEach((tag) => {
    const key = TOOL_ICON_MAP[tag.textContent.trim().toLowerCase()];
    if (!key) return;
    const svg = brandMarkup(key);
    if (svg) tag.insertAdjacentHTML('afterbegin', svg);
  });
}

// ─── Nav active state ───
export function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav__links a');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove('active'));
          document.querySelector(`.nav__links a[href="#${entry.target.id}"]`)?.classList.add('active');
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  sections.forEach((s) => observer.observe(s));
}

// ─── Buttons ───
export function initButtons() {
  document.getElementById('hero-preview')?.addEventListener('click', () => {
    document.getElementById('niveles')?.scrollIntoView({ behavior: 'smooth' });
  });
}
