import { niveles, getNivel } from './data/niveles.js';

// ─── Routing ───
function getCurrentId() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id') ?? '0', 10);
  return isNaN(id) ? 0 : Math.max(0, Math.min(id, niveles.length - 1));
}

function navigate(id) {
  window.location.search = `?id=${id}`;
}

// ─── Sidebar ───
function buildSidebar(currentId) {
  const list = document.getElementById('sidebar-list');
  const groups = [
    { label: 'Etapa I — Docker', etapa: 'docker', ids: [0,1,2,3,4,5,6,7,8,9] },
    { label: 'Etapa II — Compose', etapa: 'compose', ids: [10,11,12,13,14] },
    { label: 'Etapa III — Kubernetes', etapa: 'k8s', ids: [15,16,17,18,19,20,21,22] },
  ];

  groups.forEach(group => {
    const label = document.createElement('div');
    label.className = 'sidebar__group-label';
    label.textContent = group.label;
    list.appendChild(label);

    group.ids.forEach(id => {
      const nivel = getNivel(id);
      if (!nivel) return;
      const item = document.createElement('a');
      item.className = 'sidebar__item' + (id === currentId ? ' active' : '');
      item.href = `?id=${id}`;
      item.innerHTML = `<span class="sidebar__item-num">${String(id).padStart(2,'0')}</span>${nivel.title}`;
      list.appendChild(item);
    });
  });
}

// ─── Header ───
function renderHeader(nivel) {
  document.title = `Nivel ${String(nivel.id).padStart(2,'0')} — ${nivel.title} — ContainersPro`;

  document.getElementById('bc-etapa').textContent = nivel.etapaLabel;
  document.getElementById('bc-nivel').textContent = nivel.title;
  document.getElementById('nivel-num').textContent = String(nivel.id).padStart(2,'0');
  document.getElementById('nivel-title').textContent = nivel.title;
  document.getElementById('nivel-objetivo').textContent = nivel.objetivo;

  const badge = document.getElementById('nivel-etapa-badge');
  badge.textContent = nivel.etapa === 'docker' ? 'Docker' : nivel.etapa === 'compose' ? 'Compose' : 'Kubernetes';
  badge.className = `nivel-header__etapa etapa--${nivel.etapa}`;
}

// ─── Content renderers ───
function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function renderProse(text) {
  return text.split('\n\n').map(p =>
    `<p class="block-prose">${renderMarkdown(p.trim())}</p>`
  ).join('');
}

function renderItems(items) {
  return `<ul class="items-list">${items.map(i => `<li>${renderMarkdown(i)}</li>`).join('')}</ul>`;
}

function renderDiagram(diagram) {
  return `<div class="diagram-block"><pre>${diagram}</pre></div>`;
}

function renderCode(code, lang = 'bash') {
  return `
    <div class="code-block">
      <div class="code-block__header">
        <span class="code-block__lang">${lang}</span>
        <button class="code-block__copy" onclick="copyCode(this)">Copiar</button>
      </div>
      <pre>${escapeHtml(code)}</pre>
    </div>`;
}

function renderLabSteps(steps) {
  return steps.map(step => `
    <div class="lab-step">
      ${step.desc ? `<p class="lab-step__desc">${renderMarkdown(step.desc)}</p>` : ''}
      <div class="lab-step__cmd"><pre>${escapeHtml(step.cmd)}</pre></div>
    </div>`).join('');
}

function renderComparison(rows) {
  const header = `<tr><th>Característica</th><th>Sin Docker</th><th>Con Docker</th></tr>`;
  const body = rows.map(r =>
    `<tr><td>${r.feature}</td><td>${r.vm}</td><td>${r.docker}</td></tr>`
  ).join('');
  return `<div style="overflow-x:auto"><table class="comparison-table"><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
}

function renderHistory(items) {
  return `<ul class="history-list">${items.map(i => `<li>${renderMarkdown(i)}</li>`).join('')}</ul>`;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderSection(section) {
  const iconMap = {
    problem: '⚡',
    analogy: '💡',
    concepts: '📖',
    diagram: '🗺',
    comparison: '⚖️',
    history: '📅',
    architecture: '🏗',
    code: '💻',
    lab: '🔬',
  };

  const icon = iconMap[section.type] ?? '·';
  let inner = '';

  switch (section.type) {
    case 'problem':
      return `<div class="block--problem">${renderProse(section.body)}</div>`;

    case 'analogy':
      return `<div class="block--analogy">${renderProse(section.body)}</div>`;

    case 'concepts':
    case 'architecture':
      inner = '';
      if (section.body) inner += `<div class="body-text">${renderMarkdown(section.body)}</div>`;
      if (section.items) inner += renderItems(section.items);
      if (section.code)  inner += renderCode(section.code, 'yaml');
      return `
        <div class="section-block">
          <h2 class="section-block__title"><span class="section-block__icon">${icon}</span>${section.title}</h2>
          ${inner}
        </div>`;

    case 'diagram':
      inner = '';
      if (section.body) inner += `<div class="body-text">${renderMarkdown(section.body)}</div>`;
      inner += renderDiagram(section.diagram);
      return `
        <div class="section-block">
          <h2 class="section-block__title"><span class="section-block__icon">${icon}</span>${section.title}</h2>
          ${inner}
        </div>`;

    case 'comparison':
      return `
        <div class="section-block">
          <h2 class="section-block__title"><span class="section-block__icon">${icon}</span>${section.title}</h2>
          ${renderComparison(section.rows)}
        </div>`;

    case 'history':
      return `
        <div class="section-block">
          <h2 class="section-block__title"><span class="section-block__icon">${icon}</span>${section.title}</h2>
          ${renderHistory(section.items)}
        </div>`;

    case 'code':
      const lang = section.title?.toLowerCase().includes('yaml') ? 'yaml'
        : section.title?.toLowerCase().includes('dockerfile') ? 'dockerfile'
        : 'bash';
      return `
        <div class="section-block">
          <h2 class="section-block__title"><span class="section-block__icon">${icon}</span>${section.title}</h2>
          ${renderCode(section.code, lang)}
        </div>`;

    case 'lab':
      return `
        <div class="section-block">
          <div class="lab-block">
            <div class="lab-block__header">🔬 ${section.title}</div>
            <div class="lab-steps">${renderLabSteps(section.steps)}</div>
          </div>
        </div>`;

    default:
      return '';
  }
}

function renderContent(nivel) {
  const container = document.getElementById('nivel-content');
  container.innerHTML = nivel.sections.map(renderSection).join('');
}

// ─── Navigation ───
function setupNav(currentId) {
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  if (currentId <= 0) btnPrev.disabled = true;
  else btnPrev.addEventListener('click', () => navigate(currentId - 1));

  if (currentId >= niveles.length - 1) btnNext.disabled = true;
  else btnNext.addEventListener('click', () => navigate(currentId + 1));
}

// ─── Progress bar ───
function setupProgress(currentId) {
  const bar = document.createElement('div');
  bar.className = 'nivel-progress';
  const inner = document.createElement('div');
  inner.className = 'nivel-progress__bar';
  inner.style.width = `${((currentId + 1) / niveles.length) * 100}%`;
  bar.appendChild(inner);
  document.body.insertBefore(bar, document.body.firstChild);
}

// ─── Copy code ───
window.copyCode = function(btn) {
  const pre = btn.closest('.code-block').querySelector('pre');
  navigator.clipboard.writeText(pre.textContent).then(() => {
    btn.textContent = '✓ Copiado';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copiar';
      btn.classList.remove('copied');
    }, 2000);
  });
};

// ─── Sidebar mobile ───
function setupSidebarMobile() {
  const sidebar = document.getElementById('sidebar');
  const openBtn = document.getElementById('sidebar-open-btn');
  const closeBtn = document.getElementById('sidebar-toggle');

  openBtn?.addEventListener('click', () => sidebar.classList.add('open'));
  closeBtn?.addEventListener('click', () => sidebar.classList.remove('open'));

  sidebar.addEventListener('click', e => {
    if (e.target.closest('.sidebar__item')) {
      sidebar.classList.remove('open');
    }
  });
}

// ─── Boot ───
document.addEventListener('DOMContentLoaded', () => {
  const id = getCurrentId();
  const nivel = getNivel(id);

  if (!nivel) {
    document.getElementById('nivel-content').innerHTML = '<p style="color:red">Nivel no encontrado.</p>';
    return;
  }

  buildSidebar(id);
  renderHeader(nivel);
  renderContent(nivel);
  setupNav(id);
  setupProgress(id);
  setupSidebarMobile();
});
