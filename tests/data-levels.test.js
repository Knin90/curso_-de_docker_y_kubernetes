// ─── Tests de estructura del contenido: data/levels/*.js ───
// Valida el contrato entre los datos y los consumidores (render.js,
// sidebar.js, landing-scenes.js): ids únicos y secuenciales, metadatos y
// la forma de cada tipo de sección.
import { describe, it, expect } from 'vitest';
import { niveles, getNivel } from '../data/niveles.js';
import { ETAPAS } from '../data/etapas.js';

// Los tipos que el renderer sabe convertir a HTML (nivel/render.js).
const KNOWN_SECTION_TYPES = new Set([
  'problem',
  'analogy',
  'concepts',
  'architecture',
  'diagram',
  'comparison',
  'history',
  'code',
  'lab',
]);

describe('estructura general de niveles', () => {
  it('expone 25 niveles', () => {
    expect(niveles).toHaveLength(25);
  });

  it('tiene ids únicos y secuenciales desde 0', () => {
    const ids = niveles.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (let i = 0; i < niveles.length; i++) {
      expect(niveles[i].id).toBe(i);
    }
  });

  it('cada nivel tiene título, etapa y objetivo', () => {
    for (const nivel of niveles) {
      expect(typeof nivel.title, `nivel ${nivel.id}`).toBe('string');
      expect(nivel.title.length, `nivel ${nivel.id}`).toBeGreaterThan(0);
      expect(['docker', 'compose', 'k8s'], `nivel ${nivel.id}`).toContain(nivel.etapa);
      expect(typeof nivel.objetivo, `nivel ${nivel.id}`).toBe('string');
      expect(nivel.objetivo.length, `nivel ${nivel.id}`).toBeGreaterThan(0);
    }
  });

  it('cada nivel tiene al menos 2 secciones', () => {
    for (const nivel of niveles) {
      expect(nivel.sections.length, `nivel ${nivel.id}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('getNivel resuelve por id y devuelve null para desconocidos', () => {
    expect(getNivel(0)).toBe(niveles[0]);
    expect(getNivel(22)).toBe(niveles[22]);
    expect(getNivel(999)).toBe(null);
    expect(getNivel(-1)).toBe(null);
  });
});

describe('estructura de secciones', () => {
  it('todos los tipos de sección son conocidos por el renderer', () => {
    for (const nivel of niveles) {
      for (const section of nivel.sections) {
        expect(
          KNOWN_SECTION_TYPES.has(section.type),
          `nivel ${nivel.id} · tipo desconocido "${section.type}"`,
        ).toBe(true);
      }
    }
  });

  it('cada sección tiene título no vacío', () => {
    for (const nivel of niveles) {
      for (const section of nivel.sections) {
        expect(typeof section.title, `nivel ${nivel.id}`).toBe('string');
        expect(section.title.length, `nivel ${nivel.id} · "${section.type}"`).toBeGreaterThan(0);
      }
    }
  });

  it('problem y analogy llevan body no vacío', () => {
    for (const nivel of niveles) {
      for (const section of nivel.sections) {
        if (section.type === 'problem' || section.type === 'analogy') {
          expect(section.body?.length, `nivel ${nivel.id} · ${section.type}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('concepts y architecture llevan items no vacíos', () => {
    for (const nivel of niveles) {
      for (const section of nivel.sections) {
        if (section.type === 'concepts' || section.type === 'architecture') {
          expect(section.items?.length, `nivel ${nivel.id} · ${section.type}`).toBeGreaterThan(0);
          for (const item of section.items) {
            expect(typeof item).toBe('string');
          }
        }
      }
    }
  });

  it('diagram lleva un SVG hand-authored válido (figure > svg con viewBox)', () => {
    for (const nivel of niveles) {
      for (const section of nivel.sections) {
        if (section.type === 'diagram') {
          const d = section.diagram;
          const ctx = `nivel ${nivel.id} — ${section.title}`;
          expect(typeof d, ctx).toBe('string');
          expect(d.length, ctx).toBeGreaterThan(0);
          expect(d, ctx).toContain('<figure class="diagram-figure">');
          expect(d, ctx).toContain('<svg');
          expect(d, ctx).toContain('role="img"');
          expect(d, ctx).toContain('aria-label="');
          expect(d, ctx).toContain('<figcaption>');
          expect(d, ctx).toMatch(/viewBox="0 0 \d+ \d+"/);
          expect(d, ctx).not.toContain('<script');
          expect(d, ctx).not.toContain('<style');
          expect(d, ctx).not.toContain('<foreignObject');
        }
      }
    }
  });

  it('comparison lleva filas con feature y columnas', () => {
    for (const nivel of niveles) {
      for (const section of nivel.sections) {
        if (section.type === 'comparison') {
          expect(section.rows?.length, `nivel ${nivel.id}`).toBeGreaterThan(0);
          for (const row of section.rows) {
            expect(typeof row.feature).toBe('string');
            // Cada fila tiene al menos una celda de comparación (vm/docker/a/b).
            const cells = [row.vm, row.docker, row.a, row.b].filter((c) => c !== undefined);
            expect(cells.length, `nivel ${nivel.id} · "${row.feature}"`).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('code lleva código no vacío', () => {
    for (const nivel of niveles) {
      for (const section of nivel.sections) {
        if (section.type === 'code') {
          expect(section.code?.length, `nivel ${nivel.id}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('lab lleva steps con desc o cmd', () => {
    for (const nivel of niveles) {
      for (const section of nivel.sections) {
        if (section.type === 'lab') {
          expect(section.steps?.length, `nivel ${nivel.id}`).toBeGreaterThan(0);
          for (const step of section.steps) {
            expect(step.cmd || step.desc, `nivel ${nivel.id}`).toBeTruthy();
          }
        }
      }
    }
  });

  it('history lleva items no vacíos', () => {
    for (const nivel of niveles) {
      for (const section of nivel.sections) {
        if (section.type === 'history') {
          expect(section.items?.length, `nivel ${nivel.id}`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('distribución por etapa (contrato con el landing)', () => {
  it('todos los ids están cubiertos por una etapa', () => {
    const byEtapa = { docker: [], compose: [], k8s: [] };
    for (const nivel of niveles) byEtapa[nivel.etapa].push(nivel.id);
    expect([...byEtapa.docker, ...byEtapa.compose, ...byEtapa.k8s].sort((a, b) => a - b)).toEqual(
      niveles.map((n) => n.id),
    );
  });

  it('cada etapa tiene al menos un nivel', () => {
    const byEtapa = { docker: [], compose: [], k8s: [] };
    for (const nivel of niveles) byEtapa[nivel.etapa].push(nivel.id);
    expect(byEtapa.docker.length).toBeGreaterThan(0);
    expect(byEtapa.compose.length).toBeGreaterThan(0);
    expect(byEtapa.k8s.length).toBeGreaterThan(0);
  });

  // Contrato datos ↔ landing: las ETAPAS (data/etapas.js) agrupan los ids de
  // cada etapa. Si se agrega/reubica un nivel sin actualizarlas, este test lo
  // detecta (drift silencioso).
  it('los ids de ETAPAS coinciden con la etapa de cada nivel (ambas direcciones)', () => {
    const byEtapa = {};
    for (const nivel of niveles) {
      (byEtapa[nivel.etapa] ??= []).push(nivel.id);
    }
    const keys = new Set(ETAPAS.map((e) => e.key));
    // Dirección datos → ETAPAS: toda etapa presente en los datos debe existir.
    for (const etapaKey of Object.keys(byEtapa)) {
      expect(keys, `la etapa "${etapaKey}" de los datos no existe en ETAPAS`).toContain(etapaKey);
    }
    // Dirección ETAPAS → datos: los ids listados deben coincidir con el campo etapa.
    for (const etapa of ETAPAS) {
      const expected = (byEtapa[etapa.key] ?? []).slice().sort((a, b) => a - b);
      const actual = etapa.ids.slice().sort((a, b) => a - b);
      expect(actual, `ETAPAS["${etapa.key}"].ids desincronizado de los datos`).toEqual(expected);
    }
  });

  it('ETAPAS cubre todos los niveles exactamente una vez', () => {
    const seen = [];
    for (const etapa of ETAPAS) seen.push(...etapa.ids);
    expect(new Set(seen).size).toBe(seen.length); // sin duplicados
    expect(seen.sort((a, b) => a - b)).toEqual(niveles.map((n) => n.id));
  });
});
