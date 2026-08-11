// Tema claro/oscuro del sitio, persistido en localStorage y aplicado a todo
// el documento vía `data-theme` en <html>.
//
// El anti-FOUC se resuelve con un script inline en <head> de cada página
// (index.html / nivel.html) que aplica el atributo antes del primer paint;
// este módulo es la API para leer/cambiar y para sincronizar entre pestañas.
//
// Uso (main.js y nivel.js):
//   import { initTheme, toggleTheme, getTheme } from './theme.js';
//   initTheme(document.getElementById('theme-toggle'));

const KEY = 'containerspro-theme';

/** Tema guardado ('light' | 'dark'); por defecto 'dark'. */
export function getTheme() {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/**
 * Aplica el tema al documento, sincroniza el botón y emite `theme:change` en
 * `document` (detail.theme) para que piezas que dependen de JS por tema —el
 * vórtice WebGL del hero, la atmósfera— se reconfiguren sin acoplarse.
 */
export function setTheme(theme, button) {
  const t = theme === 'light' ? 'light' : 'dark';
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* almacenamiento no disponible: el tema aplica solo para la sesión */
  }
  document.documentElement.setAttribute('data-theme', t);
  if (button) syncToggle(button, t);
  document.dispatchEvent(new CustomEvent('theme:change', { detail: { theme: t } }));
  return t;
}

/** Invierte el tema. Devuelve el nuevo valor ('light' | 'dark'). */
export function toggleTheme(button) {
  const next = getTheme() === 'light' ? 'dark' : 'light';
  setTheme(next, button);
  return next;
}

/** Refleja el estado actual en el botón (aria-label, aria-pressed, icono). */
export function syncToggle(button, theme = getTheme()) {
  if (!button) return;
  const light = theme === 'light';
  button.setAttribute('aria-pressed', String(light));
  button.setAttribute('aria-label', light ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
}

/**
 * Inicializa el tema y cablea el botón del toggle + sync entre pestañas
 * (un cambio en otra pestaña se refleja aquí al instante).
 */
export function initTheme(button) {
  const current = getTheme();
  document.documentElement.setAttribute('data-theme', current);
  if (button) {
    syncToggle(button, current);
    button.addEventListener('click', () => toggleTheme(button));
  }
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      const t = e.newValue === 'light' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', t);
      syncToggle(button, t);
      // Cambio desde otra pestaña: misma reconfiguración JS que el toggle.
      document.dispatchEvent(new CustomEvent('theme:change', { detail: { theme: t } }));
    }
  });
  return current;
}
