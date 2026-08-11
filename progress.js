// Progreso del curso por nivel, persistido en localStorage.
// Formato: {
//   "completed": [0, 3, 5, ...],   ids de niveles completados
//   "last": 7,                     último nivel visitado
//   "sections": { "3": [0, 2, 5] } índices de sección leídos por nivel
//   "feedback": { "3": { "vote": 1, "comment": "..." } }
//                                  voto (1/-1) y comentario por nivel
// }
//
// Es un módulo compartido: lo usan el landing (main.js) y la página de
// nivel (nivel.js), que se sincronizan vía localStorage al navegar.

const KEY = 'containerspro-progress';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    const sections = {};
    if (data?.sections && typeof data.sections === 'object') {
      for (const [k, v] of Object.entries(data.sections)) {
        if (Array.isArray(v)) {
          sections[k] = v.filter(n => Number.isInteger(n));
        }
      }
    }
    const feedback = {};
    if (data?.feedback && typeof data.feedback === 'object') {
      for (const [k, v] of Object.entries(data.feedback)) {
        if (v && typeof v === 'object') {
          feedback[k] = {
            vote: v.vote === 1 || v.vote === -1 ? v.vote : 0,
            comment: typeof v.comment === 'string' ? v.comment : '',
          };
        }
      }
    }
    return {
      completed: Array.isArray(data?.completed)
        ? data.completed.filter(n => Number.isInteger(n))
        : [],
      last: Number.isInteger(data?.last) ? data.last : null,
      sections,
      feedback,
    };
  } catch {
    return { completed: [], last: null, sections: {}, feedback: {} };
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* almacenamiento no disponible (modo privado, cuota): silencioso */
  }
}

/** Índices de sección marcados como leídos en el nivel `id`. */
export function getReadSections(id) {
  return read().sections[String(id)] ?? [];
}

/** Marca/desmarca la sección `index` del nivel `id`. Devuelve el nuevo estado. */
export function toggleSectionRead(id, index) {
  const data = read();
  const key = String(id);
  const set = new Set(data.sections[key] ?? []);
  const read = !set.has(index);
  if (read) set.add(index); else set.delete(index);
  data.sections[key] = [...set].sort((a, b) => a - b);
  write(data);
  return read;
}

/** Número de secciones leídas en el nivel `id`. */
export function readSectionsCount(id) {
  return getReadSections(id).length;
}

/** Feedback del nivel `id`: { vote: 1 | -1 | 0, comment: string }. */
export function getFeedback(id) {
  return read().feedback[String(id)] ?? { vote: 0, comment: '' };
}

/** Guarda el voto (1 = 👍, -1 = 👎) del nivel `id`. */
export function setFeedbackVote(id, vote) {
  const data = read();
  const key = String(id);
  const prev = data.feedback[key] ?? { vote: 0, comment: '' };
  data.feedback[key] = { vote: vote === 1 || vote === -1 ? vote : 0, comment: prev.comment };
  write(data);
}

/** Guarda el comentario del nivel `id`. */
export function setFeedbackComment(id, comment) {
  const data = read();
  const key = String(id);
  const prev = data.feedback[key] ?? { vote: 0, comment: '' };
  data.feedback[key] = { vote: prev.vote, comment: String(comment ?? '') };
  write(data);
}

/** Conteos globales de feedback para el resumen del landing. */
export function feedbackStats() {
  const { feedback } = read();
  let up = 0, down = 0, comments = 0;
  for (const f of Object.values(feedback)) {
    if (f.vote === 1) up++;
    else if (f.vote === -1) down++;
    if (f.comment.trim()) comments++;
  }
  return { up, down, comments };
}

/** ¿El nivel `id` está marcado como completado? */
export function isCompleted(id) {
  return read().completed.includes(id);
}

/** Cambia el estado de completado de un nivel. Devuelve el nuevo estado. */
export function toggleCompleted(id) {
  const data = read();
  const set = new Set(data.completed);
  const done = !set.has(id);
  if (done) set.add(id); else set.delete(id);
  data.completed = [...set].sort((a, b) => a - b);
  write(data);
  return done;
}

/** Marca el nivel `id` como último visitado. */
export function setLastVisited(id) {
  const data = read();
  data.last = id;
  write(data);
}

/** Número total de niveles completados. */
export function completedCount() {
  return read().completed.length;
}

/** Último nivel visitado (o null si nunca se visitó uno). */
export function getLastVisited() {
  return read().last;
}
