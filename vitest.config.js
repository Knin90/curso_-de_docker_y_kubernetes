// ─── Vitest — tests unitarios de las funciones puras ───
// Entorno node (sin DOM): los módulos testeados (render, progress, data)
// son puros o mockean sus dependencias (localStorage). La config de build
// de Vite (vite.config.js) no aplica aquí: los tests no necesitan los
// plugins de fuentes ni el multi-page build.
//
// NOTA de versiones: Vitest queda fijado en 3.x (~3.2.7) porque Vite 5 no
// exporta el subpath "vite/module-runner" que Vitest 4 requiere. Si algún
// día se sube Vite a 6+, se puede subir Vitest a 4 en la misma tanda.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      // Solo los módulos puros que los tests unitarios cubren. Los entry
      // points y el código DOM (main/, nivel/, atmosphere/, vortex/,
      // scene-engine.js, etc.) requieren jsdom o E2E y se quedan fuera del
      // scope de esta pirámide por diseño.
      //
      // FOOTGUN: el include es una lista blanca — un módulo puro nuevo que
      // no esté listado acá queda invisible a la cobertura sin avisar.
      // Regla: al extraer/mover lógica pura a un módulo nuevo, agregarlo
      // a este include (y escribirle tests).
      include: ['progress.js', 'nivel/render.js', 'data/**/*.js', 'scene-engine-utils.js'],
      // Umbral por archivo: protege el contrato de cada módulo puro sin
      // castigar a un módulo por la deuda de otro.
      thresholds: {
        perFile: true,
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
