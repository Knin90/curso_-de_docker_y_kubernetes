// Estado compartido del modo escenas: lo escribe scenes.js y lo leen
// sidebar.js (clicks del índice) y progress-ui.js (refresco del HUD al
// marcar una sección como leída). Vive en su propio módulo para evitar
// import circular entre esos tres.
export const sceneState = { enabled: false, setActive: null, scrollTo: null, refreshHudRead: null };
