// ─── Routing y navegación prev/next entre niveles ───
import { niveles, getNivel } from '../data/niveles.js';

export function getCurrentId() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id') ?? '0', 10);
  return isNaN(id) ? 0 : Math.max(0, Math.min(id, niveles.length - 1));
}

export function navigate(id) {
  window.location.search = `?id=${id}`;
}

export function setupNav(currentId) {
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const prev = getNivel(currentId - 1);
  const next = getNivel(currentId + 1);

  btnPrev.innerHTML = prev
    ? `
      <span class="nivel-nav__dir"><i class="ph ph-arrow-left" aria-hidden="true"></i> Anterior</span>
      <span class="nivel-nav__name">${String(prev.id).padStart(2, '0')} · ${prev.title}</span>`
    : `<span class="nivel-nav__dir">Anterior</span>`;
  btnPrev.disabled = !prev;
  if (prev) btnPrev.addEventListener('click', () => navigate(currentId - 1));

  btnNext.innerHTML = next
    ? `
      <span class="nivel-nav__name">${String(next.id).padStart(2, '0')} · ${next.title}</span>
      <span class="nivel-nav__dir">Siguiente <i class="ph ph-arrow-right" aria-hidden="true"></i></span>`
    : `<span class="nivel-nav__dir">Siguiente</span>`;
  btnNext.disabled = !next;
  if (next) btnNext.addEventListener('click', () => navigate(currentId + 1));
}
