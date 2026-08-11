import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

/**
 * Elimina los formatos de fuente Phosphor que los navegadores modernos nunca
 * descargan (solo usan woff2). El CSS de @phosphor-icons/web declara 4 formatos
 * y Vite los copia todos a dist: svg (~3 MB), ttf (~489 kB) y woff (~489 kB)
 * quedan como peso muerto en el deploy.
 */
function stripUnusedFontFormats() {
  return {
    name: 'strip-unused-font-formats',
    generateBundle(_, bundle) {
      for (const name of Object.keys(bundle)) {
        if (/^assets\/Phosphor-.*\.(svg|ttf|woff)$/.test(name)) {
          delete bundle[name];
        }
      }
    },
  };
}

// Build multi-página: el proyecto tiene dos entradas HTML
export default defineConfig({
  build: {
    // three.js (vendor cacheado) supera los 500 kB por diseño; es un chunk
    // separado que se carga solo en el hero y se cachea de forma estable.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        nivel: fileURLToPath(new URL('./nivel.html', import.meta.url)),
      },
      output: {
        manualChunks(id) {
          // Chunks vendor cacheados por separado: three solo se carga en el
          // hero (vórtice, dynamic import) y gsap se comparte entre páginas.
          if (id.includes('node_modules/three')) return 'vendor-three';
          if (id.includes('node_modules/gsap')) return 'vendor-gsap';
        },
      },
    },
  },
  plugins: [stripUnusedFontFormats()],
});
