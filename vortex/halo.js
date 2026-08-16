// ─── Anillo de energía sobre el contenedor: se llena y enciende con la
// energía del scroll. Se ancla al padre del contenedor (el vórtice suele
// vivir en un wrap desbordado; en el hero el padre coincide con el viewport). ───
export function buildHalo(container) {
  const host = container.parentElement || container;
  const el = document.createElement('div');
  el.className = 'vortex-energy';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
    '<span class="vortex-energy-aura"></span>' +
    '<svg class="vortex-energy-ring" viewBox="0 0 120 120">' +
    '<circle class="vortex-energy-track" cx="60" cy="60" r="52"/>' +
    '<circle class="vortex-energy-arc" cx="60" cy="60" r="52"/>' +
    '</svg>';
  host.appendChild(el);

  const arc = el.querySelector('.vortex-energy-arc');
  const aura = el.querySelector('.vortex-energy-aura');
  const ARC_LEN = 2 * Math.PI * 52; // longitud del arco (r=52 en el viewBox)

  // Actualización por frame: el arco se llena con la energía (0..1), el halo
  // y su aura se encienden, y el golpe (flash) añade un destello extra.
  const sync = ({ energy, flash }) => {
    const e = Math.min(Math.max(energy, 0), 1);
    arc.style.strokeDashoffset = (ARC_LEN * (1 - e)).toFixed(2);
    el.style.opacity = Math.min(0.14 + e * 0.72 + flash * 0.5, 1).toFixed(3);
    aura.style.opacity = Math.min(0.1 + e * 0.8 + flash * 0.9, 1).toFixed(3);
    el.style.transform = `scale(${(1 + e * 0.05 + flash * 0.07).toFixed(3)})`;
  };

  return { el, sync };
}
