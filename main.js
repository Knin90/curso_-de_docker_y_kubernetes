import { niveles } from './data/niveles.js';

// ─── Stat counter animation ───
function animateCounters() {
  const els = document.querySelectorAll('.stat__num[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = target > 100 ? '+' : '';
      const duration = 1200;
      const step = 16;
      const increment = target / (duration / step);
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + increment, target);
        el.textContent = Math.floor(current) + (current >= target ? suffix : '');
        if (current >= target) clearInterval(timer);
      }, step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => observer.observe(el));
}

// ─── Etapa tabs ───
function initEtapaTabs() {
  const tabs = document.querySelectorAll('.etapa-tab');
  const contents = document.querySelectorAll('.etapa-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.etapa;
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.etapa-content[data-content="${target}"]`)?.classList.add('active');
    });
  });
}

// ─── Build nivel cards dynamically ───
function buildNivelCards() {
  const grid = document.getElementById('niveles-grid');
  if (!grid) return;
  grid.innerHTML = '';

  niveles.forEach(nivel => {
    // Extract summary bullets from sections
    const bullets = [];
    nivel.sections.forEach(s => {
      if (s.items) bullets.push(...s.items.slice(0, 2));
      if (bullets.length >= 4) return;
    });

    const haLab = nivel.sections.some(s => s.type === 'lab');
    const labSection = nivel.sections.find(s => s.type === 'lab');
    const isFinal = nivel.id === 22;

    const etapaLabel = nivel.etapa === 'docker' ? 'Docker'
      : nivel.etapa === 'compose' ? 'Compose'
      : 'Kubernetes';

    const card = document.createElement('div');
    card.className = `nivel-card${isFinal ? ' nivel-card--final' : ''}`;
    card.dataset.nivel = nivel.id;

    card.innerHTML = `
      <div class="nivel-card__header">
        <span class="nivel-card__num">${String(nivel.id).padStart(2,'0')}</span>
        <div>
          <h3 class="nivel-card__title">${nivel.title}</h3>
          <span class="nivel-card__etapa etapa--${nivel.etapa}">${etapaLabel}</span>
        </div>
        <span class="nivel-card__toggle">+</span>
      </div>
      <div class="nivel-card__body">
        <ul>
          ${bullets.slice(0,4).map(b => `<li>${b.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>')}</li>`).join('')}
        </ul>
        ${haLab ? `<div class="nivel-card__lab">🔬 ${labSection?.title ?? 'Laboratorio'}</div>` : ''}
        <a class="nivel-card__link" href="nivel.html?id=${nivel.id}">
          Ver nivel completo →
        </a>
      </div>`;

    grid.appendChild(card);
  });

  initNivelCards();
}

// ─── Nivel cards accordion ───
function initNivelCards() {
  document.querySelectorAll('.nivel-card__header').forEach(header => {
    header.addEventListener('click', () => {
      const card = header.closest('.nivel-card');
      const isOpen = card.classList.contains('open');
      document.querySelectorAll('.nivel-card').forEach(c => c.classList.remove('open'));
      if (!isOpen) card.classList.add('open');
    });
  });
}

// ─── Nav active state ───
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav__links a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        document.querySelector(`.nav__links a[href="#${entry.target.id}"]`)?.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => observer.observe(s));
}

// ─── Buttons ───
function initButtons() {
  document.getElementById('hero-preview')?.addEventListener('click', () => {
    document.getElementById('niveles')?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ─── Reveal on scroll ───
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeIn 300ms ease both';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.tool-group, .proyecto__layer, .method__step, .ruta__item').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  animateCounters();
  initEtapaTabs();
  buildNivelCards();
  initNavHighlight();
  initButtons();
  initReveal();
});
