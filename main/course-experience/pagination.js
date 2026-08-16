// ─── Indicador de paginación: 01/23 + barra de progreso del recorrido ───
import { gsap } from 'gsap';

export function createPagination(container, total) {
  container.innerHTML = `
    <span class="course-exp-pag__current" id="course-exp-pag-current">01</span>
    <div class="course-exp-pag__track" role="progressbar" aria-label="Progreso en el temario"
      aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="1">
      <div class="course-exp-pag__fill" id="course-exp-pag-fill"></div>
    </div>
    <span class="course-exp-pag__total">${String(total).padStart(2, '0')}</span>`;

  const current = container.querySelector('#course-exp-pag-current');
  const fill = container.querySelector('#course-exp-pag-fill');
  const track = container.querySelector('.course-exp-pag__track');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setIndex(index, animate = true) {
    const display = index + 1;
    if (current) current.textContent = String(display).padStart(2, '0');
    track?.setAttribute('aria-valuenow', String(display));
    const ratio = total > 1 ? index / (total - 1) : 1;
    if (!fill) return;
    if (!animate || reduced) {
      gsap.set(fill, { scaleX: ratio });
      return;
    }
    gsap.to(fill, { scaleX: ratio, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
  }

  return { setIndex };
}
