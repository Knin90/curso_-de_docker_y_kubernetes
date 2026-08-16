// ─── Panel de métricas: derivadas de `sections`, nunca hardcodeadas ───
// módulos = nº de secciones · ejemplos = nº total de items · laboratorios =
// nº de secciones type:'lab'.
import { gsap } from 'gsap';

export function computeMetrics(nivel) {
  const modules = nivel.sections.length;
  const examples = nivel.sections.reduce((acc, s) => acc + (s.items?.length ?? 0), 0);
  const labs = nivel.sections.filter((s) => s.type === 'lab').length;
  return { modules, examples, labs };
}

const ITEMS = [
  { key: 'modules', label: 'Módulos', icon: 'ph-squares-four' },
  { key: 'examples', label: 'Ejemplos', icon: 'ph-code' },
  { key: 'labs', label: 'Laboratorios', icon: 'ph-flask' },
];

export function createMetrics(container) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  container.innerHTML = ITEMS.map(
    (it) => `
    <div class="course-exp-metric">
      <i class="ph ${it.icon}" aria-hidden="true"></i>
      <span class="course-exp-metric__num" data-key="${it.key}">0</span>
      <span class="course-exp-metric__label">${it.label}</span>
    </div>`,
  ).join('');
  const nums = {};
  ITEMS.forEach((it) => {
    nums[it.key] = container.querySelector(`[data-key="${it.key}"]`);
  });
  let current = { modules: 0, examples: 0, labs: 0 };

  /** Actualiza el panel; si `animate`, cuenta como odómetro corto. */
  function setMetrics(nivel, animate = true) {
    const target = computeMetrics(nivel);
    if (!animate || reduced) {
      ITEMS.forEach((it) => {
        if (nums[it.key]) nums[it.key].textContent = String(target[it.key]);
      });
      current = target;
      return;
    }
    ITEMS.forEach((it) => {
      const from = { v: current[it.key] };
      gsap.to(from, {
        v: target[it.key],
        duration: 0.5,
        ease: 'power1.out',
        onUpdate: () => {
          if (nums[it.key]) nums[it.key].textContent = String(Math.round(from.v));
        },
      });
    });
    current = target;
  }

  return { setMetrics };
}
