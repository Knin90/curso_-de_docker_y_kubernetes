// ─── ESLint (flat config, v10) — análisis estático del proyecto ───
// Vanilla JS + Vite, dos páginas (landing + nivel). Reglas base recomendadas
// (@eslint/js) + globals de navegador + integración con Prettier
// (eslint-config-prettier desactiva las reglas de formato que pelearían).
// Scope: solo código fuente — se ignoran dist/, node_modules/ y los
// directorios de herramientas del agente (.claude/, .agents/, etc.).
import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.claude/**',
      '.agents/**',
      '.atl/**',
      '.codex/**',
      '.impeccable/**',
      'scripts/**',
    ],
  },

  // Reglas base: lo que cualquier JS razonable debería respetar.
  js.configs.recommended,

  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // ── Estilo del proyecto ──
      // Igualdad estricta siempre (=== / !==).
      eqeqeq: ['error', 'always'],
      // Preferir const sobre let cuando el binding no se reasigna.
      'prefer-const': ['error', { destructuring: 'all' }],
      // Flechas con paréntesis consistentes (estilo del proyecto: siempre).
      'arrow-parens': ['error', 'always'],
      // Comillas simples (convención del proyecto).
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      // Espaciado consistente en objetos, arrays y bloques.
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'block-spacing': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      // Punto y coma obligatorio.
      semi: ['error', 'always'],
      // Sin variables declaradas y nunca usadas (los prefijos _ se ignoran:
      // hay parámetros descartados deliberadamente en callbacks de GSAP).
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // No usar var.
      'no-var': 'error',

      // ── Limpieza ──
      // Evitar asignaciones dentro de condiciones (if (a = b)).
      'no-cond-assign': ['error', 'always'],
      // Sin console.log en producción (warn para no romper el build).
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Sin bloques vacíos (excepto catch que se documenta como silencioso).
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Numeros mágicos fuera: preferir constantes con nombre.
      // (No se activa no-magic-numbers: el proyecto tiene valores de
      // animación/scroll legítimos; se mantiene como buena práctica manual.)
      'no-useless-escape': 'error',
      'no-else-return': 'error',
      'no-self-compare': 'error',
    },
  },

  // Apaga las reglas de formato que entran en conflicto con Prettier.
  // IMPORTANTE: debe ser el último para no pisar reglas de arriba.
  eslintConfigPrettier,
];
