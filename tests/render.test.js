// ─── Tests de los renderers puros: markdown inline, prosa y resaltado ───
// nivel/render.js convierte texto de los niveles en HTML. Estas funciones no
// tocan el DOM, así que se testean sin jsdom.
import { describe, it, expect } from 'vitest';
import { renderMarkdown, renderProse, highlightCode, renderSection, escapeHtml } from '../nivel/render.js';

describe('renderMarkdown', () => {
  it('convierte **negrita** en <strong>', () => {
    expect(renderMarkdown('un **valor** importante')).toBe('un <strong>valor</strong> importante');
  });

  it('convierte `código` inline en <code>', () => {
    expect(renderMarkdown('corré `docker ps`')).toBe('corré <code>docker ps</code>');
  });

  it('convierte *cursiva* en <em>', () => {
    expect(renderMarkdown('es *crítico*')).toBe('es <em>crítico</em>');
  });

  it('combina los tres formatos en una sola cadena', () => {
    const input = '**Docker** es *liviano*: corré `docker run`';
    expect(renderMarkdown(input)).toBe(
      '<strong>Docker</strong> es <em>liviano</em>: corré <code>docker run</code>',
    );
  });

  it('no toca texto sin formato', () => {
    expect(renderMarkdown('texto plano sin marcado')).toBe('texto plano sin marcado');
  });

  it('no interfiere con asteriscos sueltos (multiplicación)', () => {
    expect(renderMarkdown('2 * 3 = 6')).toBe('2 * 3 = 6');
  });
});

describe('renderProse', () => {
  it('envuelve cada párrafo en .block-prose', () => {
    const html = renderProse('primer párrafo\n\nsegundo párrafo');
    expect(html).toContain('<p class="block-prose">primer párrafo</p>');
    expect(html).toContain('<p class="block-prose">segundo párrafo</p>');
  });

  it('aplica markdown dentro de cada párrafo', () => {
    const html = renderProse('hola **mundo**');
    expect(html).toContain('<strong>mundo</strong>');
  });

  it('recorta espacios de cada párrafo', () => {
    const html = renderProse('  con espacios  ');
    expect(html).toContain('<p class="block-prose">con espacios</p>');
  });
});

describe('highlightCode', () => {
  it('resalta las palabras clave de bash', () => {
    const html = highlightCode('docker ps');
    expect(html).toContain('<span class="token-keyword">docker</span>');
    expect(html).toContain('<span class="token-keyword">ps</span>');
  });

  it('resalta números como token-number', () => {
    const html = highlightCode('nginx:1.21');
    expect(html).toContain('<span class="token-number">1.21</span>');
  });

  it('resalta comentarios como token-comment', () => {
    const html = highlightCode('# esto es un comentario');
    expect(html).toContain('<span class="token-comment"># esto es un comentario</span>');
  });

  it('resalta variables $VAR como token-var', () => {
    const html = highlightCode('echo $HOME');
    expect(html).toContain('<span class="token-var">$HOME</span>');
  });

  it('resalta strings entre comillas como token-string', () => {
    const html = highlightCode('echo "hola mundo"');
    expect(html).toContain('<span class="token-string">"hola mundo"</span>');
  });

  it('escapa HTML dentro del código (seguridad)', () => {
    const html = highlightCode('<script>alert("x")</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('soporta lenguaje yaml', () => {
    const html = highlightCode('services:', 'yaml');
    expect(html).toContain('<span class="token-keyword">services</span>');
  });

  it('soporta lenguaje dockerfile (keywords en mayúscula)', () => {
    const html = highlightCode('FROM node:20', 'dockerfile');
    expect(html).toContain('<span class="token-keyword">FROM</span>');
  });

  it('usa bash como lenguaje por defecto', () => {
    const html = highlightCode('docker run -d');
    expect(html).toContain('<span class="token-keyword">docker</span>');
    expect(html).toContain('<span class="token-keyword">run</span>');
  });

  it('no inyecta tokens dentro de una palabra (dockerfile vs docker)', () => {
    const html = highlightCode('dockerfile');
    // "dockerfile" es una palabra completa: el resaltador por palabra no debe
    // partir "dockerfile" en "docker" + "file".
    expect(html).not.toContain('token-keyword">docker<');
  });

  it('cae a bash para lenguajes desconocidos', () => {
    const html = highlightCode('docker ps', 'python');
    expect(html).toContain('<span class="token-keyword">docker</span>');
  });

  it('hace match de keywords sin importar mayúsculas (DOCKER → docker)', () => {
    const html = highlightCode('DOCKER PS');
    expect(html).toContain('<span class="token-keyword">DOCKER</span>');
  });

  it('escapa ampersands a &amp;', () => {
    const html = highlightCode('a && b');
    expect(html).toContain('&amp;&amp;');
    expect(html).not.toContain('&&');
  });
});

describe('escapeHtml', () => {
  it('escapa &, < y >', () => {
    expect(escapeHtml('<a href="x">b & c</a>')).toBe('&lt;a href="x"&gt;b &amp; c&lt;/a&gt;');
  });

  it('deja intacto el texto plano', () => {
    expect(escapeHtml('texto normal')).toBe('texto normal');
  });
});

describe('renderSection', () => {
  it('renderiza problem como callout con tag Desafío', () => {
    const html = renderSection({ type: 'problem', title: 'El problema', body: 'algo **mal**' });
    expect(html).toContain('callout--problem');
    expect(html).toContain('Desafío');
    expect(html).toContain('<strong>mal</strong>');
  });

  it('renderiza analogy como callout con tag Contexto', () => {
    const html = renderSection({ type: 'analogy', title: 'Analogía', body: 'como un barco' });
    expect(html).toContain('callout--analogy');
    expect(html).toContain('Contexto');
    expect(html).toContain('como un barco');
  });

  it('renderiza concepts con items', () => {
    const html = renderSection({
      type: 'concepts',
      title: 'Conceptos',
      items: ['uno', 'dos'],
    });
    expect(html).toContain('items-list');
    expect(html).toContain('uno');
    expect(html).toContain('dos');
    expect(html).toContain('section-block__title');
  });

  it('renderiza diagram como bloque con el SVG provisto', () => {
    const html = renderSection({
      type: 'diagram',
      title: 'Topología',
      diagram: '<figure class="diagram-figure"><svg role="img" aria-label="x"></svg></figure>',
    });
    expect(html).toContain('diagram-block');
    expect(html).toContain('<figure class="diagram-figure">');
  });

  it('inyecta el SVG del diagrama sin escapar (markup de autor, no input de usuario)', () => {
    const svg = '<figure class="diagram-figure"><svg role="img" aria-label="a"><path d="M0,0"/></svg></figure>';
    const html = renderSection({ type: 'diagram', title: 'T', diagram: svg });
    // El campo `diagram` ahora es SVG hand-authored por el equipo del curso, no
    // input de usuario: se inyecta crudo (renderDiagram ya no llama a
    // escapeHtml sobre él) para que el navegador lo pinte como vector.
    expect(html).toContain(svg);
    expect(html).not.toContain('&lt;svg');
  });

  it('renderiza comparison con filas', () => {
    const html = renderSection({
      type: 'comparison',
      title: 'Comparación',
      rows: [{ feature: 'Arranque', vm: 'Lento', docker: 'Rápido' }],
    });
    expect(html).toContain('comparison-table');
    expect(html).toContain('Arranque');
    expect(html).toContain('Rápido');
  });

  it('renderiza history con items', () => {
    const html = renderSection({
      type: 'history',
      title: 'Historia',
      items: ['**2013** nace', '2024 hoy'],
    });
    expect(html).toContain('history-list');
    expect(html).toContain('<strong>2013</strong> nace');
  });

  it('renderiza code con resaltado y lenguaje por título', () => {
    // El detector de lenguaje busca 'yaml' o 'dockerfile' en el título: un
    // título sin esas palabras cae a bash.
    const html = renderSection({ type: 'code', title: 'docker-compose.yml', code: 'docker ps' });
    expect(html).toContain('code-block');
    expect(html).toContain('code-block__lang">bash');
    expect(html).toContain('token-keyword">docker');
    expect(html).toContain('token-keyword">ps');
  });

  it('detecta yaml en el título para resaltar keywords de yaml', () => {
    const html = renderSection({ type: 'code', title: 'Servicio en YAML', code: 'services:' });
    expect(html).toContain('code-block__lang">yaml');
    expect(html).toContain('token-keyword">services');
  });

  it('renderiza lab con pasos numerados', () => {
    const html = renderSection({
      type: 'lab',
      title: 'Lab',
      steps: [{ desc: 'crear', cmd: 'docker run' }, { cmd: 'docker ps' }],
    });
    expect(html).toContain('lab-block');
    expect(html).toContain('2 pasos');
    expect(html).toContain('lab-step__num">01');
    expect(html).toContain('lab-step__num">02');
    // El comando se resalta: 'docker run' no aparece literal sino partido en spans.
    expect(html).toContain('token-keyword">docker');
    expect(html).toContain('token-keyword">run');
  });

  it('devuelve vacío para tipos desconocidos', () => {
    expect(renderSection({ type: 'unknown', title: 'X' })).toBe('');
  });
});
