// ─── Progreso de lectura, feedback (pulgares + comentario), botón de
// completado, barra superior fija y el botón "Copiar" de los code blocks. ───
import {
  isCompleted,
  toggleCompleted,
  getReadSections,
  getFeedback,
  setFeedbackVote,
  setFeedbackComment,
} from '../progress.js';
import { sceneState } from './scene-state.js';

// ─── Progreso de secciones leídas del nivel ───
// Refresca el contador y la barra del TOC, los checks de los items y la
// barra superior fija del nivel (nivel-progress). Se llama tras cada toggle.
export function renderLevelProgress(nivelId) {
  const toc = document.querySelector('.sidebar__toc');
  if (!toc) return;

  const total = toc.querySelectorAll('.toc-item').length;
  if (!total) return;

  // Una sola lectura del store: read ya trae la lista completa
  const read = getReadSections(nivelId);
  const pct = Math.round((read.length / total) * 100);

  const count = toc.querySelector('.sidebar__toc-progress-count');
  const fill = toc.querySelector('.sidebar__toc-progress-fill');
  if (count) count.textContent = `${read.length} / ${total}`;
  if (fill) fill.style.width = `${pct}%`;

  toc.querySelectorAll('.toc-item').forEach((item) => {
    const sec = parseInt(item.dataset.sec, 10);
    const on = read.includes(sec);
    item.classList.toggle('done', on);
    const check = item.querySelector('.toc-item__check');
    if (check) {
      check.setAttribute('aria-pressed', String(on));
      const label = on ? `Sección ${sec + 1} leída` : `Marcar sección ${sec + 1} como leída`;
      check.setAttribute('aria-label', label);
      check.title = label;
    }
  });

  // Barra superior fija del nivel (la misma que anima GSAP en initGSAP)
  const topBar = document.querySelector('.nivel-progress__bar');
  if (topBar) topBar.style.width = `${pct}%`;

  // El HUD del modo escenas muestra el contador de leído: se refresca con
  // cada toggle (hook instalado por initSceneZoom).
  sceneState.refreshHudRead?.();
}

// ─── Feedback del nivel: pulgares + comentario ───
export function initFeedback(nivelId) {
  const root = document.getElementById('nivel-feedback');
  if (!root) return;

  const votes = [...root.querySelectorAll('.nivel-feedback__vote')];
  const textarea = document.getElementById('feedback-comment');
  const saveBtn = document.getElementById('feedback-save');

  // El comentario se sincroniza del store solo al iniciar: después, votar
  // nunca pisa lo que el usuario tenga escrito sin guardar.
  if (textarea) textarea.value = getFeedback(nivelId).comment;

  const apply = () => {
    const fb = getFeedback(nivelId);
    votes.forEach((btn) => {
      const on = parseInt(btn.dataset.vote, 10) === fb.vote;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  };

  // Pulgares: alternan — volver a tocar el mismo quita el voto
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('.nivel-feedback__vote');
    if (!btn) return;
    const vote = parseInt(btn.dataset.vote, 10);
    const current = getFeedback(nivelId).vote;
    setFeedbackVote(nivelId, current === vote ? 0 : vote);
    apply();
  });

  // Comentario: se guarda explícitamente (evita escribir en cada tecla).
  // El flash de "Guardado" usa un único timeout: si se pulsa dos veces rápido,
  // el segundo clic cancela el anterior y restaura siempre el original.
  const span = saveBtn?.querySelector('span');
  const icon = saveBtn?.querySelector('.ph');
  const ORIGINAL = { label: span?.textContent ?? '', cls: icon?.className ?? '' };
  let flashTimer = null;
  const flashSaved = () => {
    clearTimeout(flashTimer);
    if (span) span.textContent = 'Guardado';
    if (icon) icon.className = 'ph ph-check';
    saveBtn?.classList.add('saved');
    flashTimer = setTimeout(() => {
      if (span) span.textContent = ORIGINAL.label;
      if (icon) icon.className = ORIGINAL.cls;
      saveBtn?.classList.remove('saved');
      flashTimer = null;
    }, 1800);
  };

  saveBtn?.addEventListener('click', () => {
    setFeedbackComment(nivelId, textarea.value);
    flashSaved();
  });

  apply();
}

// ─── Marcar nivel como completado ───
export function initCompleteButton(nivel) {
  const btn = document.getElementById('nivel-complete');
  if (!btn) return;
  const label = btn.querySelector('.nivel-complete__label');

  const apply = (animate = false) => {
    const done = isCompleted(nivel.id);
    btn.classList.toggle('done', done);
    btn.setAttribute('aria-pressed', String(done));
    label.textContent = done ? 'Completado' : 'Marcar como completado';
    if (animate && done) {
      btn.classList.remove('celebrate');
      requestAnimationFrame(() => btn.classList.add('celebrate'));
    }
  };

  apply();
  btn.addEventListener('click', () => {
    toggleCompleted(nivel.id);
    apply(true);
    window.__refreshSidebar?.();
  });
}

// ─── Progress bar ───
export function setupProgress() {
  const bar = document.createElement('div');
  bar.className = 'nivel-progress';
  const inner = document.createElement('div');
  inner.className = 'nivel-progress__bar';
  // El ancho lo fija renderLevelProgress (se llama en el boot y tras cada
  // toggle de sección): aquí solo se crea la estructura.
  inner.style.width = '0%';
  bar.appendChild(inner);
  document.body.insertBefore(bar, document.body.firstChild);
}

// ─── Copy code ───
window.copyCode = function (btn) {
  const pre = btn.closest('.code-block, .lab-step__cmd')?.querySelector('pre');
  if (!pre) return;
  navigator.clipboard.writeText(pre.textContent).then(() => {
    const original = btn.innerHTML;
    const originalLabel = btn.getAttribute('aria-label');
    btn.innerHTML = '<i class="ph ph-check" aria-hidden="true"></i> Copiado';
    btn.setAttribute('aria-label', 'Copiado');
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = original;
      if (originalLabel) btn.setAttribute('aria-label', originalLabel);
      else btn.removeAttribute('aria-label');
      btn.classList.remove('copied');
    }, 2000);
  });
};
