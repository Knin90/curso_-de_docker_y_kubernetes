// ─── Renderers de contenido: markdown inline, código con resaltado,
// diagramas ASCII, comparaciones, labs. Todo lo que convierte una
// `section` de data/levels/*.js en HTML de la página de nivel. ───

export function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

export function renderProse(text) {
  return text
    .split('\n\n')
    .map((p) => `<p class="block-prose">${renderMarkdown(p.trim())}</p>`)
    .join('');
}

/* ─── Resaltado de sintaxis ligero (bash / yaml / dockerfile) ───
   Tokeniza el código crudo y escapa cada pieza: seguro frente a entidades
   HTML dentro de strings y comentarios. */
const SYNTAX_KEYWORDS = {
  bash: new Set([
    'docker',
    'docker-compose',
    'kubectl',
    'podman',
    'run',
    'build',
    'pull',
    'push',
    'exec',
    'ps',
    'logs',
    'stop',
    'rm',
    'images',
    'compose',
    'up',
    'down',
    'start',
    'restart',
    'inspect',
    'tag',
    'system',
    'prune',
    'volume',
    'network',
    'sudo',
    'apt',
    'dnf',
    'yum',
    'systemctl',
    'git',
    'curl',
    'cd',
    'chmod',
    'echo',
    'cat',
    'mkdir',
    'cp',
    'mv',
    'export',
    'unset',
    'exit',
    'install',
    'update',
    'enable',
    'config',
  ]),
  yaml: new Set([
    'services',
    'image',
    'build',
    'ports',
    'volumes',
    'environment',
    'depends_on',
    'networks',
    'restart',
    'container_name',
    'command',
    'labels',
    'version',
    'driver',
    'external',
    'name',
    'context',
    'dockerfile',
    'args',
    'target',
    'platform',
    'hostname',
    'stdin_open',
    'tty',
    'entrypoint',
    'expose',
    'healthcheck',
    'test',
    'interval',
    'timeout',
    'retries',
    'deploy',
    'replicas',
    'resources',
    'limits',
    'cpus',
    'memory',
    'reservations',
  ]),
  dockerfile: new Set([
    'FROM',
    'RUN',
    'COPY',
    'CMD',
    'ENTRYPOINT',
    'EXPOSE',
    'ENV',
    'WORKDIR',
    'USER',
    'LABEL',
    'ARG',
    'VOLUME',
    'ADD',
    'SHELL',
    'HEALTHCHECK',
    'STOPSIGNAL',
    'ONBUILD',
    'MAINTAINER',
  ]),
};

const SYNTAX_RE =
  /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|#[^\n]*|\$\{?[A-Za-z_][A-Za-z0-9_]*\}?|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_-]*\b|[\s\S])/g;

export function highlightCode(code, lang = 'bash') {
  const kws = SYNTAX_KEYWORDS[lang] || SYNTAX_KEYWORDS.bash;
  return code.replace(SYNTAX_RE, (m) => {
    if (m.startsWith('"') || m.startsWith("'")) return `<span class="token-string">${escapeHtml(m)}</span>`;
    if (m.startsWith('#')) return `<span class="token-comment">${escapeHtml(m)}</span>`;
    if (m.startsWith('$')) return `<span class="token-var">${escapeHtml(m)}</span>`;
    if (/^\d/.test(m)) return `<span class="token-number">${escapeHtml(m)}</span>`;
    if (kws.has(m.toLowerCase()) || kws.has(m)) return `<span class="token-keyword">${escapeHtml(m)}</span>`;
    return escapeHtml(m);
  });
}

function renderItems(items) {
  return `<ul class="items-list">${items
    .map(
      (i) => `
    <li class="items-list__item">
      <span class="items-list__mark" aria-hidden="true"><i class="ph ph-check"></i></span>
      <span class="items-list__text">${renderMarkdown(i)}</span>
    </li>`,
    )
    .join('')}</ul>`;
}

function renderDiagram(diagram) {
  return `
    <div class="diagram-block">
      <div class="diagram-block__bar">
        <span class="win-dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="diagram-block__label">topología</span>
      </div>
      ${diagram}
    </div>`;
}

function renderCode(code, lang = 'bash') {
  return `
    <div class="code-block">
      <div class="code-block__bar">
        <span class="win-dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="code-block__lang">${lang}</span>
        <button class="code-block__copy" onclick="copyCode(this)">Copiar</button>
      </div>
      <pre>${highlightCode(code, lang)}</pre>
    </div>`;
}

function renderLabSteps(steps) {
  return steps
    .map(
      (step, i) => `
    <div class="lab-step">
      <span class="lab-step__num">${String(i + 1).padStart(2, '0')}</span>
      <div class="lab-step__body">
        ${step.desc ? `<p class="lab-step__desc">${renderMarkdown(step.desc)}</p>` : ''}
        <div class="lab-step__cmd">
          <pre>${highlightCode(step.cmd)}</pre>
          <button class="lab-step__cmd-copy" onclick="copyCode(this)" aria-label="Copiar comando"><i class="ph ph-copy-simple" aria-hidden="true"></i></button>
        </div>
      </div>
    </div>`,
    )
    .join('');
}

function renderComparison(rows, headers = ['Característica', 'Sin Docker', 'Con Docker']) {
  const header = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`;
  const body = rows
    .map((r) => `<tr><td>${r.feature}</td><td>${r.a ?? r.vm}</td><td>${r.b ?? r.docker}</td></tr>`)
    .join('');
  return `
    <div class="comparison-table-wrap">
      <div class="comparison-table-scroll">
        <table class="comparison-table">
          <thead>${header}</thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    </div>`;
}

function renderHistory(items) {
  return `<ul class="history-list">${items.map((i) => `<li>${renderMarkdown(i)}</li>`).join('')}</ul>`;
}

// Exportado para tests unitarios (renderSection y los helpers que llama).
export function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* Iconos por tipo de sección: compartidos entre el render y el índice (sidebar.js) */
export const SECTION_ICONS = {
  problem: '<i class="ph ph-lightning" aria-hidden="true"></i>',
  analogy: '<i class="ph ph-lightbulb" aria-hidden="true"></i>',
  concepts: '<i class="ph ph-book-open" aria-hidden="true"></i>',
  diagram: '<i class="ph ph-map-trifold" aria-hidden="true"></i>',
  comparison: '<i class="ph ph-scales" aria-hidden="true"></i>',
  history: '<i class="ph ph-calendar-dots" aria-hidden="true"></i>',
  architecture: '<i class="ph ph-buildings" aria-hidden="true"></i>',
  code: '<i class="ph ph-code" aria-hidden="true"></i>',
  lab: '<i class="ph ph-flask" aria-hidden="true"></i>',
};

// Exportado para tests unitarios: el dispatcher que recorre todos los
// helpers de render (items, diagram, code, lab, comparison, history).
export function renderSection(section, index = 0) {
  const icon = SECTION_ICONS[section.type] ?? '';
  const idx = String(Math.max(index, 1)).padStart(2, '0');

  const head = `
    <div class="section-block__head">
      <span class="section-block__index">${idx}</span>
      <h2 class="section-block__title"><span class="section-block__icon">${icon}</span>${section.title}</h2>
      <span class="section-block__rule" aria-hidden="true"></span>
    </div>`;

  switch (section.type) {
    case 'problem':
    case 'analogy':
      return `
        <aside class="callout callout--${section.type} block--${section.type}">
          <div class="callout__head">
            <span class="callout__icon">${icon}</span>
            <span class="callout__title">${section.title}</span>
            <span class="callout__tag">${section.type === 'problem' ? 'Desafío' : 'Contexto'}</span>
          </div>
          <div class="callout__body">${renderProse(section.body)}</div>
        </aside>`;

    case 'concepts':
    case 'architecture': {
      let inner = '';
      if (section.body) inner += `<div class="body-text">${renderMarkdown(section.body)}</div>`;
      if (section.items) inner += renderItems(section.items);
      if (section.code) inner += renderCode(section.code, 'yaml');
      return `<div class="section-block">${head}${inner}</div>`;
    }

    case 'diagram': {
      let inner = '';
      if (section.body) inner += `<div class="body-text">${renderMarkdown(section.body)}</div>`;
      inner += renderDiagram(section.diagram);
      return `<div class="section-block">${head}${inner}</div>`;
    }

    case 'comparison':
      return `<div class="section-block">${head}${renderComparison(section.rows, section.headers)}</div>`;

    case 'history':
      return `<div class="section-block">${head}${renderHistory(section.items)}</div>`;

    case 'code': {
      const lang = section.title?.toLowerCase().includes('yaml')
        ? 'yaml'
        : section.title?.toLowerCase().includes('dockerfile')
          ? 'dockerfile'
          : 'bash';
      return `<div class="section-block">${head}${renderCode(section.code, lang)}</div>`;
    }

    case 'lab':
      return `
        <div class="section-block">
          <div class="lab-block">
            <div class="lab-block__header">
              <span class="lab-block__icon"><i class="ph ph-flask" aria-hidden="true"></i></span>
              <span class="lab-block__title">${section.title}</span>
              <span class="lab-block__count">${section.steps.length} pasos</span>
            </div>
            <div class="lab-steps">${renderLabSteps(section.steps)}</div>
          </div>
        </div>`;

    default:
      return '';
  }
}

export function renderContent(nivel) {
  const container = document.getElementById('nivel-content');
  // Numeración de secciones solo para los bloques que muestran `head`
  // (los callouts de problema/analogía y el lab no llevan número).
  const numbered = ['concepts', 'architecture', 'diagram', 'comparison', 'history', 'code'];
  let n = 0;
  container.innerHTML = nivel.sections
    .map((s, i) => {
      const html = renderSection(s, numbered.includes(s.type) ? ++n : 0);
      // Envoltorio con id de ancla (scrollspy) + estructura de escena del modo
      // escenas: .nivel-scene (pantalla completa) > __inner (centrado) > __body.
      // Sin el modo escenas, estos divs son neutrales y el flujo no cambia.
      return `
      <div class="nivel-sec nivel-scene" id="nivel-sec-${i}" data-scene="${i}">
        <div class="nivel-scene__inner">
          <div class="nivel-scene__body">${html}</div>
        </div>
      </div>`;
    })
    .join('');
}
