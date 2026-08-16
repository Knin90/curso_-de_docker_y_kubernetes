import { describe, it, expect } from 'vitest';
import {
  clamp,
  glideDt,
  glideStepY,
  moduleY,
  canSceneScroll,
  enteredStage,
  sceneTransition,
  activeIndexFromProgress,
} from '../scene-engine-utils.js';

describe('clamp', () => {
  it('acota por debajo al límite inferior', () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(-5, -2, 10)).toBe(-2);
  });

  it('acota por arriba al límite superior', () => {
    expect(clamp(2)).toBe(1);
    expect(clamp(20, 0, 10)).toBe(10);
  });

  it('deja pasar valores dentro del rango', () => {
    expect(clamp(0.5)).toBe(0.5);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('respeta los límites inclusivos', () => {
    expect(clamp(0)).toBe(0);
    expect(clamp(1)).toBe(1);
    expect(clamp(-2, -2, 2)).toBe(-2);
    expect(clamp(2, -2, 2)).toBe(2);
  });
});

describe('glideDt', () => {
  it('devuelve el delta real entre frames', () => {
    expect(glideDt(120, 80)).toBe(40);
  });

  it('acota el delta a 64ms (frenado de frame)', () => {
    expect(glideDt(1000, 100)).toBe(64);
  });

  it('con last 0/falsy el delta es 0 (primer frame no avanza)', () => {
    // `last || now` → now, así que now - now = 0: el primer frame del glide
    // no mueve nada (comportamiento original del motor, preservado).
    expect(glideDt(250, 0)).toBe(0);
    expect(glideDt(250, null)).toBe(0);
    expect(glideDt(250, undefined)).toBe(0);
  });
});

describe('glideStepY', () => {
  it('aplica el lag filter exponencial exacto', () => {
    // current += (target - current) * (1 - exp(-dt/tau))
    const current = 0;
    const target = 100;
    const dt = 50;
    const tau = 100;
    const expected = 100 * (1 - Math.exp(-50 / 100));
    expect(glideStepY(current, target, dt, tau)).toBeCloseTo(expected, 10);
  });

  it('converge hacia el target sin pasarse', () => {
    let y = 0;
    const target = 100;
    const tau = 170;
    let prev = -1;
    for (let i = 0; i < 500; i++) {
      y = glideStepY(y, target, 16, tau);
      expect(y).toBeLessThanOrEqual(target);
      expect(y).toBeGreaterThanOrEqual(prev);
      prev = y;
    }
    expect(y).toBeCloseTo(target, 2);
  });

  it('no se mueve cuando dt es 0', () => {
    expect(glideStepY(42, 100, 0, 170)).toBe(42);
  });

  it('tau menor converge más rápido', () => {
    const step = (tau) => {
      let y = 0;
      for (let i = 0; i < 10; i++) y = glideStepY(y, 100, 16, tau);
      return y;
    };
    expect(step(50)).toBeGreaterThan(step(500));
  });

  it('con target alcanzado, el valor no cambia', () => {
    expect(glideStepY(100, 100, 16, 170)).toBe(100);
  });
});

describe('moduleY', () => {
  it('el módulo 0 arranca pasado el fundido de entrada', () => {
    expect(moduleY(1000, 0, 5, 4000, 600)).toBe(1000 + 600 * 0.8);
  });

  it('distribuye los módulos sobre el recorrido de escenas', () => {
    // start 1000, 5 módulos, recorrido 4000, sin offset de entrada para k>0
    expect(moduleY(1000, 1, 5, 4000, 600)).toBe(1000 + (1 / 4) * 4000);
    expect(moduleY(1000, 4, 5, 4000, 600)).toBe(1000 + 4000);
  });

  it('clampea k fuera de rango a los extremos', () => {
    expect(moduleY(1000, -3, 5, 4000, 600)).toBe(moduleY(1000, 0, 5, 4000, 600));
    expect(moduleY(1000, 99, 5, 4000, 600)).toBe(moduleY(1000, 4, 5, 4000, 600));
  });

  it('soporta un solo módulo sin dividir por cero', () => {
    expect(moduleY(500, 0, 1, 0, 300)).toBe(500 + 300 * 0.8);
  });
});

describe('canSceneScroll', () => {
  it('devuelve false sin escena', () => {
    expect(canSceneScroll(null, 1)).toBe(false);
    expect(canSceneScroll(undefined, -1)).toBe(false);
  });

  it('hacia abajo solo si hay contenido restante', () => {
    expect(canSceneScroll({ scrollTop: 0, scrollHeight: 1000, clientHeight: 500 }, 1)).toBe(true);
    // al final: scrollHeight - clientHeight - 1 = 499; scrollTop 500 >= eso → no puede
    expect(canSceneScroll({ scrollTop: 500, scrollHeight: 1000, clientHeight: 500 }, 1)).toBe(false);
  });

  it('hacia arriba solo si ya scrolleó', () => {
    expect(canSceneScroll({ scrollTop: 0, scrollHeight: 1000, clientHeight: 500 }, -1)).toBe(false);
    expect(canSceneScroll({ scrollTop: 5, scrollHeight: 1000, clientHeight: 500 }, -1)).toBe(true);
  });
});

describe('enteredStage', () => {
  it('no entra antes del umbral del fundido', () => {
    expect(enteredStage(100, 0, 600)).toBe(false);
  });

  it('entra pasado scrollY > wrapStart + enterFade*0.4', () => {
    expect(enteredStage(241, 0, 600)).toBe(true);
    expect(enteredStage(1000, 100, 600)).toBe(true);
  });
});

describe('sceneTransition', () => {
  const TRANS = 0.45;

  it('en sf=0: primera escena activa, t=0, sin punch', () => {
    expect(sceneTransition(0, 5, TRANS)).toEqual({ k: 0, t: 0, punch: 0 });
  });

  it('en sf=N-1-ε: última transición completa', () => {
    const { k, t } = sceneTransition(4, 5, TRANS);
    expect(k).toBe(3);
    // el ε de 1e-4 del clamp evita que t llegue a 1 exacto (la última
    // escena se revela en onLeave, no en updateScenes)
    expect(t).toBeCloseTo(1, 3);
  });

  it('t llega a 1 recién al final de la fracción de zoom', () => {
    // local < 1-TRANS → t = 0
    expect(sceneTransition(0.3, 5, TRANS).t).toBe(0);
    // local = 0.7 → (0.7 - 0.55)/0.45 = 1/3
    expect(sceneTransition(0.7, 5, TRANS).t).toBeCloseTo(1 / 3, 10);
  });

  it('clampea sf negativo al inicio', () => {
    expect(sceneTransition(-5, 5, TRANS).k).toBe(0);
  });

  it('clampea sf enorme al final', () => {
    const r = sceneTransition(999, 5, TRANS);
    expect(r.k).toBeLessThan(4);
    expect(r.t).toBeCloseTo(1, 3);
  });

  it('punch crece con la velocidad y se clampea a 0.035', () => {
    expect(sceneTransition(1, 5, TRANS, 100).punch).toBeCloseTo(0.02, 10);
    expect(sceneTransition(1, 5, TRANS, 10000).punch).toBe(0.035);
    // vel negativa → mismo punch (usa el valor absoluto)
    expect(sceneTransition(1, 5, TRANS, -100).punch).toBeCloseTo(0.02, 10);
    expect(sceneTransition(1, 5, TRANS, -50000).punch).toBe(0.035);
    expect(sceneTransition(1, 5, TRANS).punch).toBe(0);
  });

  it('con un solo módulo devuelve la escena única a escala 1', () => {
    expect(sceneTransition(0, 1, TRANS, 0)).toEqual({ k: 0, t: 1, punch: 0 });
    expect(sceneTransition(999, 1, TRANS, 5000)).toEqual({ k: 0, t: 1, punch: 0 });
  });
});

describe('activeIndexFromProgress', () => {
  it('redondea la posición flotante', () => {
    expect(activeIndexFromProgress(0.4, 5)).toBe(0);
    expect(activeIndexFromProgress(0.5, 5)).toBe(1);
    expect(activeIndexFromProgress(2.4, 5)).toBe(2);
  });

  it('clampea a los extremos', () => {
    expect(activeIndexFromProgress(-1, 5)).toBe(0);
    expect(activeIndexFromProgress(99, 5)).toBe(4);
  });
});
