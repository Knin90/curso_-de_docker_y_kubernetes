// ─── Header del nivel: título, breadcrumb, meta OG/Twitter, chips de
// resumen y la torre 3D decorativa (CSS puro) que identifica la etapa. ───

export function renderHeader(nivel) {
  document.title = `Nivel ${String(nivel.id).padStart(2, '0')} — ${nivel.title} — ContainersPro`;

  // Meta dinámica para compartir (OG / Twitter)
  const og = { title: document.title, description: nivel.objetivo };
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', og.title);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', og.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', og.description);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', og.description);

  document.getElementById('bc-etapa').textContent = nivel.etapaLabel;
  document.getElementById('bc-nivel').textContent = nivel.title;
  document.getElementById('nivel-num').textContent = String(nivel.id).padStart(2, '0');
  document.getElementById('nivel-title').textContent = nivel.title;
  document.getElementById('nivel-objetivo').textContent = nivel.objetivo;

  const badge = document.getElementById('nivel-etapa-badge');
  badge.textContent =
    nivel.etapa === 'docker' ? 'Docker' : nivel.etapa === 'compose' ? 'Compose' : 'Kubernetes';
  badge.className = `nivel-badge__etapa etapa--${nivel.etapa}`;

  // Chips de resumen del contenido del nivel
  const meta = document.getElementById('nivel-meta');
  if (meta) {
    const labs = nivel.sections.filter((s) => s.type === 'lab');
    const codes = nivel.sections.filter((s) => s.type === 'code').length;
    meta.innerHTML = `
      <span class="nivel-header__chip"><i class="ph ph-book-open" aria-hidden="true"></i> ${nivel.sections.length} secciones</span>
      <span class="nivel-header__chip"><i class="ph ph-code" aria-hidden="true"></i> ${codes} bloques de código</span>
      <span class="nivel-header__chip"><i class="ph ph-flask" aria-hidden="true"></i> ${labs.length} laboratorio${labs.length === 1 ? '' : 's'}</span>`;
  }
}

// ─── Stack 3D (CSS) ───
export function buildStack3D(nivel) {
  const el = document.getElementById('nivel-stack');
  if (!el) return;

  const etapa = nivel.etapa === 'compose' ? 'compose' : nivel.etapa === 'k8s' ? 'k8s' : 'docker';
  el.className = `stack3d stack3d--${etapa}`;

  const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
  const units = Array.from(
    { length: 3 },
    () =>
      `<div class="stack3d__unit">${faces.map((f) => `<div class="stack3d__face stack3d__face--${f}"></div>`).join('')}</div>`,
  ).join('');

  // Partículas que orbitan alrededor de la torre
  const dots = (count, cls) =>
    Array.from(
      { length: count },
      (_, i) => `<span class="stack3d__dot ${cls}" style="--i:${i}"></span>`,
    ).join('');

  el.innerHTML = `
    <div class="stack3d__float">
      <div class="stack3d__orbit stack3d__orbit--a" aria-hidden="true">${dots(3, 'stack3d__dot--a')}</div>
      <div class="stack3d__orbit stack3d__orbit--b" aria-hidden="true">${dots(3, 'stack3d__dot--b')}</div>
      <div class="stack3d__stack">${units}</div>
    </div>`;
}
