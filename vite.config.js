import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { pluginExportar } from './server/exportar.js';

// Las marcas viven en /brands y se sirven tal cual: las piezas cargan sus
// fuentes y logos desde ahí (http://localhost:5173/brands/<marca>/...).
// /api/exportar convierte la pieza en PNG o PDF (ver server/exportar.js).
export default defineConfig({
  plugins: [react(), pluginExportar()],
  server: { port: 5173, strictPort: true, watch: { ignored: ['**/salida/**'] } },
});
