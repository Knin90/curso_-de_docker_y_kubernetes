// ─── Tests del módulo de progreso (localStorage persistido) ───
// progress.js depende solo de localStorage: se mockea con un stub en
// memoria para testear el contrato completo sin navegador.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Stub de localStorage en memoria, aislado por test. Se registra en
// beforeEach (y se desmonta en afterEach) para que cada test arranque limpio:
// progress.js solo toca localStorage dentro de sus funciones, nunca al
// importar, así que el orden de registro es seguro.
const storage = new Map();

const progress = await import('../progress.js');

beforeEach(() => {
  storage.clear();
  vi.stubGlobal('localStorage', {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    clear: () => storage.clear(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('toggleCompleted / isCompleted / completedCount', () => {
  it('marca un nivel como completado y lo reporta', () => {
    expect(progress.isCompleted(3)).toBe(false);
    const done = progress.toggleCompleted(3);
    expect(done).toBe(true);
    expect(progress.isCompleted(3)).toBe(true);
    expect(progress.completedCount()).toBe(1);
  });

  it('desmarca un nivel ya completado', () => {
    progress.toggleCompleted(5);
    const done = progress.toggleCompleted(5);
    expect(done).toBe(false);
    expect(progress.isCompleted(5)).toBe(false);
    expect(progress.completedCount()).toBe(0);
  });

  it('persiste el orden de los ids completados', () => {
    progress.toggleCompleted(10);
    progress.toggleCompleted(2);
    progress.toggleCompleted(7);
    const data = JSON.parse(localStorage.getItem('containerspro-progress'));
    expect(data.completed).toEqual([2, 7, 10]);
  });
});

describe('setLastVisited / getLastVisited', () => {
  it('guarda y recupera el último nivel visitado', () => {
    expect(progress.getLastVisited()).toBe(null);
    progress.setLastVisited(4);
    expect(progress.getLastVisited()).toBe(4);
  });
});

describe('toggleSectionRead / getReadSections / readSectionsCount', () => {
  it('marca una sección como leída', () => {
    expect(progress.getReadSections(1)).toEqual([]);
    const read = progress.toggleSectionRead(1, 2);
    expect(read).toBe(true);
    expect(progress.getReadSections(1)).toEqual([2]);
  });

  it('desmarca una sección al alternar de nuevo', () => {
    progress.toggleSectionRead(1, 2);
    const read = progress.toggleSectionRead(1, 2);
    expect(read).toBe(false);
    expect(progress.getReadSections(1)).toEqual([]);
  });

  it('mantiene secciones por nivel independientes', () => {
    progress.toggleSectionRead(1, 0);
    progress.toggleSectionRead(2, 4);
    expect(progress.getReadSections(1)).toEqual([0]);
    expect(progress.getReadSections(2)).toEqual([4]);
  });

  it('ordena las secciones leídas', () => {
    progress.toggleSectionRead(1, 3);
    progress.toggleSectionRead(1, 1);
    expect(progress.getReadSections(1)).toEqual([1, 3]);
  });

  it('reporta el conteo de secciones leídas', () => {
    progress.toggleSectionRead(1, 0);
    progress.toggleSectionRead(1, 1);
    expect(progress.readSectionsCount(1)).toBe(2);
  });
});

describe('Feedback: setFeedbackVote / setFeedbackComment / getFeedback', () => {
  it('inicia sin voto ni comentario', () => {
    expect(progress.getFeedback(9)).toEqual({ vote: 0, comment: '' });
  });

  it('guarda el voto (1 = 👍, -1 = 👎)', () => {
    progress.setFeedbackVote(9, 1);
    expect(progress.getFeedback(9).vote).toBe(1);
    progress.setFeedbackVote(9, -1);
    expect(progress.getFeedback(9).vote).toBe(-1);
  });

  it('rechaza votos inválidos', () => {
    progress.setFeedbackVote(9, 42);
    expect(progress.getFeedback(9).vote).toBe(0);
  });

  it('conserva el comentario al cambiar el voto y viceversa', () => {
    progress.setFeedbackComment(9, 'muy claro');
    progress.setFeedbackVote(9, 1);
    expect(progress.getFeedback(9)).toEqual({ vote: 1, comment: 'muy claro' });
  });

  it('guarda el comentario', () => {
    progress.setFeedbackComment(9, 'excelente nivel');
    expect(progress.getFeedback(9).comment).toBe('excelente nivel');
  });
});

describe('feedbackStats', () => {
  it('resume votos y comentarios globales', () => {
    progress.setFeedbackVote(1, 1);
    progress.setFeedbackVote(2, 1);
    progress.setFeedbackVote(3, -1);
    progress.setFeedbackComment(4, 'un comentario');
    expect(progress.feedbackStats()).toEqual({ up: 2, down: 1, comments: 1 });
  });
});

describe('tolerancia a datos corruptos', () => {
  it('no explota con localStorage inválido', () => {
    localStorage.setItem('containerspro-progress', '{esto-no-es-json');
    expect(progress.completedCount()).toBe(0);
    expect(progress.getLastVisited()).toBe(null);
    expect(progress.getFeedback(1)).toEqual({ vote: 0, comment: '' });
  });

  it('ignora entradas no numéricas en completed', () => {
    localStorage.setItem(
      'containerspro-progress',
      JSON.stringify({ completed: [1, 'x', null, 2], last: 'raro' }),
    );
    expect(progress.isCompleted(1)).toBe(true);
    expect(progress.isCompleted(2)).toBe(true);
    expect(progress.completedCount()).toBe(2);
    expect(progress.getLastVisited()).toBe(null);
  });
});
