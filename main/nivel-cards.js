// ─── Tarjetas de nivel en el landing: construcción, acordeón, progreso
// (marcar/desmarcar desde la grilla) y el CTA "continuar donde quedaste". ───
import { niveles } from '../data/niveles.js';
import {
  isCompleted,
  toggleCompleted,
  completedCount,
  getLastVisited,
  getFeedback,
  feedbackStats,
} from '../progress.js';

// ─── Build nivel cards dinámicamente ───
export function buildNivelCards() {
  const grid = document.getElementById('niveles-grid');
  if (!grid) return;
  grid.innerHTML = '';

  niveles.forEach((nivel) => {
    // Extract summary bullets from sections (2 por sección, máx. 4 en total)
    const bullets = [];
    for (const s of nivel.sections) {
      if (s.items) bullets.push(...s.items.slice(0, 2));
      if (bullets.length >= 4) break;
    }

    const haLab = nivel.sections.some((s) => s.type === 'lab');
    const labSection = nivel.sections.find((s) => s.type === 'lab');
    const isFinal = nivel.id === niveles.length - 1;

    const etapaLabel =
      nivel.etapa === 'docker' ? 'Docker' : nivel.etapa === 'compose' ? 'Compose' : 'Kubernetes';

    const done = isCompleted(nivel.id);
    const fb = getFeedback(nivel.id);
    const card = document.createElement('div');
    card.className = `nivel-card${isFinal ? ' nivel-card--final' : ''}${done ? ' done' : ''}`;
    card.dataset.nivel = nivel.id;

    card.innerHTML = `
      <div class="nivel-card__header">
        <button type="button" class="nivel-card__trigger"
          aria-expanded="false" aria-controls="nivel-body-${nivel.id}">
          <span class="nivel-card__num">${String(nivel.id).padStart(2, '0')}</span>
          <div>
            <h3 class="nivel-card__title">${nivel.title}</h3>
            <span class="nivel-card__etapa etapa--${nivel.etapa}">${etapaLabel}</span>
          </div>
        </button>
        ${
          fb.vote !== 0
            ? `
        <span class="nivel-card__fb nivel-card__fb--${fb.vote === 1 ? 'up' : 'down'}" role="img" title="${fb.vote === 1 ? 'Te gustó este nivel' : 'Marcaste este nivel para mejorar'}" aria-label="${fb.vote === 1 ? 'Te gustó este nivel' : 'Marcaste este nivel para mejorar'}">
          <i class="ph ${fb.vote === 1 ? 'ph-thumbs-up' : 'ph-thumbs-down'}" aria-hidden="true"></i>
        </span>`
            : ''
        }
        <button class="nivel-card__check${done ? ' done' : ''}" data-id="${nivel.id}" aria-pressed="${done}" aria-label="${done ? 'Marcar como pendiente' : 'Marcar como completado'}" title="${done ? 'Marcar como pendiente' : 'Marcar como completado'}">
          <i class="ph ph-check" aria-hidden="true"></i>
        </button>
        <span class="nivel-card__toggle" aria-hidden="true">+</span>
      </div>
      <div class="nivel-card__body" id="nivel-body-${nivel.id}">
        <ul>
          ${bullets
            .slice(0, 4)
            .map(
              (b) =>
                `<li>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>')}</li>`,
            )
            .join('')}
        </ul>
        ${haLab ? `<div class="nivel-card__lab"><i class="ph ph-flask" aria-hidden="true"></i> ${labSection?.title ?? 'Laboratorio'}</div>` : ''}
        <a class="nivel-card__link" href="nivel.html?id=${nivel.id}">
          Ver nivel completo <i class="ph ph-arrow-right" aria-hidden="true"></i>
        </a>
      </div>`;

    grid.appendChild(card);
  });

  initNivelCards();
}

// ─── Nivel cards accordion ───
// El trigger real es el botón .nivel-card__trigger (num + título): botón
// nativo, así Enter/Espacio y el foco funcionan sin handlers extra, y el
// check de completado queda como hermano (nada de botones anidados). El
// header completo abre la tarjeta por ratón, salvo el check.
function initNivelCards() {
  const syncExpanded = () => {
    document.querySelectorAll('.nivel-card').forEach((c) => {
      const trigger = c.querySelector('.nivel-card__trigger');
      trigger?.setAttribute('aria-expanded', String(c.classList.contains('open')));
    });
  };

  document.querySelectorAll('.nivel-card__header').forEach((header) => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('.nivel-card__check')) return;
      const card = header.closest('.nivel-card');
      const isOpen = card.classList.contains('open');
      document.querySelectorAll('.nivel-card').forEach((c) => c.classList.remove('open'));
      if (!isOpen) card.classList.add('open');
      syncExpanded();
    });
  });
}

// ─── Progreso: marcar/desmarcar nivel desde la grid ───
// La delegación vive en la sección #niveles (ancestro estable): funciona
// tanto con la grilla en flujo como con el panel "todos los niveles" del
// carousel (main/course-experience/), que reparenta esta misma grid.
export function initProgressGrid() {
  const section = document.getElementById('niveles');
  if (!section) return;

  section.addEventListener('click', (e) => {
    const check = e.target.closest('.nivel-card__check');
    if (!check) return;
    e.stopPropagation();
    const id = parseInt(check.dataset.id, 10);
    const done = toggleCompleted(id);
    const card = check.closest('.nivel-card');
    card.classList.toggle('done', done);
    check.classList.toggle('done', done);
    check.setAttribute('aria-pressed', String(done));
    check.title = done ? 'Marcar como pendiente' : 'Marcar como completado';
    updateProgressSummary();
    // El carousel escucha este evento para refrescar sus 3 cards visibles
    // y el panel de progreso del nivel activo (main/course-experience/).
    document.dispatchEvent(new CustomEvent('course-progress:change', { detail: { id, done } }));
  });
}

// ─── Resumen de progreso arriba de la grid ───
export function updateProgressSummary() {
  const el = document.querySelector('.niveles__progress');
  if (!el) return;
  const total = niveles.length;
  const done = completedCount();
  const pct = total ? Math.round((done / total) * 100) : 0;
  const { up, down, comments } = feedbackStats();
  const fbLine =
    up + down + comments > 0
      ? `
      <div class="niveles__progress-feedback">
        ${up > 0 ? `<span class="niveles__progress-fb niveles__progress-fb--up"><i class="ph ph-thumbs-up" aria-hidden="true"></i> ${up}</span>` : ''}
        ${down > 0 ? `<span class="niveles__progress-fb niveles__progress-fb--down"><i class="ph ph-thumbs-down" aria-hidden="true"></i> ${down}</span>` : ''}
        ${comments > 0 ? `<span class="niveles__progress-fb niveles__progress-fb--comments"><i class="ph ph-chats-circle" aria-hidden="true"></i> ${comments} comentario${comments === 1 ? '' : 's'}</span>` : ''}
      </div>`
      : '';
  el.innerHTML = `
    <div class="niveles__progress-head">
      <span class="niveles__progress-label">
        <i class="ph ph-check-circle" aria-hidden="true"></i>
        Progreso del curso
      </span>
      <span class="niveles__progress-count">${done} / ${total} niveles</span>
    </div>
    <div class="niveles__progress-track">
      <div class="niveles__progress-fill" role="progressbar"
        aria-label="Progreso del curso" aria-valuemin="0" aria-valuemax="100"
        aria-valuenow="${pct}" style="width:${pct}%"></div>
    </div>
    ${fbLine}`;
}

// ─── Continuar donde quedaste (último nivel visitado) ───
export function initContinueCta() {
  const last = getLastVisited();
  const cta = document.getElementById('continue-cta');
  if (!cta) return;
  if (last === null) {
    cta.remove();
    return;
  }
  const nivel = niveles[last];
  if (!nivel) {
    cta.remove();
    return;
  }
  cta.href = `nivel.html?id=${last}`;
  cta.querySelector('.continue-cta__label').textContent = nivel.title;
  cta.querySelector('.continue-cta__num').textContent = String(last).padStart(2, '0');
}
