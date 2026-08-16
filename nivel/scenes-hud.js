// ─── HUD del modo escenas: número de módulo, % de avance, título y
// contador de secciones leídas. Extraído de scenes.js para mantenerlo
// bajo las 400 líneas — es un widget de lectura, no de física de scroll. ───
import { getReadSections } from '../progress.js';

export function createHud(nivel) {
  const counter = document.getElementById('scene-counter');
  const counterNum = document.getElementById('scene-counter-current');
  const counterTotal = document.getElementById('scene-counter-total');
  const counterTitle = document.getElementById('scene-counter-title');
  const counterFill = document.getElementById('scene-counter-fill');
  const counterPct = document.getElementById('scene-counter-pct');
  const counterRead = document.getElementById('scene-counter-read');
  const counterReadCount = document.getElementById('scene-counter-read-count');

  const N = nivel.sections.length;
  let lastDisplay = -1;
  let lastPct = -1;

  const refreshHudRead = () => {
    if (!counterRead || !counterReadCount) return;
    const read = getReadSections(nivel.id);
    const count = read.length;
    counterReadCount.textContent = `Leído ${count}/${N}`;
    counterRead.classList.toggle('done', count > 0);
  };

  const clamp01 = (v) => Math.min(N - 1, Math.max(0, v));

  // sf: posición flotante en [0, N-1] del recorrido de escenas.
  const updateHud = (sf) => {
    if (!counter) return;
    const display = Math.min(N, Math.max(1, Math.round(sf) + 1));
    if (display !== lastDisplay) {
      lastDisplay = display;
      if (counterNum) counterNum.textContent = String(display).padStart(2, '0');
      if (counterTitle) counterTitle.textContent = nivel.sections[display - 1]?.title ?? '';
      refreshHudRead();
    }
    const pct = Math.round((clamp01(sf) / (N - 1)) * 100);
    if (pct !== lastPct) {
      lastPct = pct;
      if (counterPct) counterPct.textContent = `${pct}%`;
    }
    if (counterFill) counterFill.style.width = `${(clamp01(sf) / (N - 1)) * 100}%`;
  };

  // Estado inicial: primera escena visible.
  const initDisplay = () => {
    if (counterTotal) counterTotal.textContent = String(N).padStart(2, '0');
    if (counterNum) counterNum.textContent = '01';
    if (counterTitle) counterTitle.textContent = nivel.sections[0]?.title ?? '';
    if (counterPct) counterPct.textContent = '0%';
    refreshHudRead();
    lastPct = 0;
    lastDisplay = 1;
  };

  return { counter, refreshHudRead, updateHud, initDisplay };
}
