import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { pluginExportar } from './server/exportar.js';

// Las marcas viven en /brands. En desarrollo Vite las sirve tal cual; al construir para publicar,
// se copian a dist/ solo los archivos que la página pide por URL (fuentes e imágenes del design
// system). Templates, schemas, tokens y logos van dentro del bundle.
function pluginCopiarMarcas() {
  return {
    name: 'fabrica-copiar-marcas',
    apply: 'build',
    closeBundle() {
      const raiz = path.resolve('brands');
      for (const marca of fs.readdirSync(raiz)) {
        for (const sub of ['fonts', 'assets']) {
          const origen = path.join(raiz, marca, 'ds', 'project', sub);
          if (!fs.existsSync(origen)) continue;
          const destino = path.resolve('dist', 'brands', marca, 'ds', 'project', sub);
          fs.cpSync(origen, destino, { recursive: true, filter: (f) => !f.endsWith('README.md') });
        }
      }
    },
  };
}

// /api/exportar convierte la pieza en PNG, PDF o ZIP (ver server/exportar.js y api/exportar.js).
export default defineConfig({
  plugins: [react(), pluginExportar(), pluginCopiarMarcas()],
  server: { port: 5173, strictPort: true, watch: { ignored: ['**/salida/**'] } },
});
