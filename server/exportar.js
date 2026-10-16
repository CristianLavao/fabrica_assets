// Exportación de piezas: el mismo documento HTML de la vista previa se renderiza en Edge
// (headless, vía playwright-core, sin descargar navegadores) y sale como PNG o PDF.
// Se monta como middleware del servidor de Vite: POST /api/exportar
// Cada archivo se devuelve al navegador y se guarda también en salida/<marca>/.

import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import path from 'node:path';
import { crearZip } from './zip.js';

const RAIZ_SALIDA = path.resolve('salida');
const LIMITE_CUERPO = 60 * 1024 * 1024; // las imágenes subidas viajan como data URL

let navegador = null;
async function obtenerNavegador() {
  if (navegador?.isConnected()) return navegador;
  try {
    navegador = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    navegador = await chromium.launch({ channel: 'chrome', headless: true });
  }
  return navegador;
}

function leerJson(req) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const partes = [];
    req.on('data', (c) => {
      total += c.length;
      if (total > LIMITE_CUERPO) {
        reject(new Error('El contenido supera 60 MB. Usa imágenes más livianas.'));
        req.destroy();
      } else partes.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(partes).toString('utf8')));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const nombreSeguro = (n) => /^[a-z0-9][a-z0-9.-]{0,150}\.(png|pdf|zip)$/.test(n);
const marcaSegura = (m) => /^[a-z0-9-]{1,40}$/.test(m);

export async function exportarPieza({ html, ancho, alto, salida, escala = 1 }) {
  const nav = await obtenerNavegador();
  const contexto = await nav.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: escala });
  const pagina = await contexto.newPage();
  try {
    await pagina.setContent(html, { waitUntil: 'networkidle', timeout: 30000 });
    await pagina.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((im) => (im.complete ? null : new Promise((r) => { im.onload = im.onerror = r; }))));
      window.ajustarPieza?.();
    });
    const desborda = await pagina.evaluate(() => document.documentElement.dataset.desborda === 'si');
    let buffer;
    if (salida === 'png') {
      buffer = await pagina.screenshot({ type: 'png', clip: { x: 0, y: 0, width: ancho, height: alto } });
    } else if (salida === 'pdf') {
      await pagina.emulateMedia({ media: 'screen' });
      buffer = await pagina.pdf({
        width: `${ancho}px`,
        height: `${alto}px`,
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        preferCSSPageSize: false,
      });
    } else {
      throw new Error(`La salida «${salida}» todavía no se exporta.`);
    }
    return { buffer, desborda };
  } finally {
    await contexto.close();
  }
}

// Landing → ZIP autónomo: index.html + assets/ (fuentes e imágenes copiadas de la marca o
// decodificadas de las imágenes subidas). Quita <base> y reescribe cada referencia a una ruta relativa.
const EXT_MIME = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg' };

export async function empaquetarLanding({ html, marca }) {
  const raizMarca = path.resolve('brands', marca);
  const baseMatch = html.match(/<base href="([^"]+)">/);
  const base = baseMatch ? baseMatch[1] : null;
  let salidaHtml = html.replace(/<base href="[^"]+">\s*/, '');
  const archivos = new Map(); // referencia original → ruta en el zip
  const entradas = [];
  let nImagen = 0;

  const resolver = async (ref) => {
    if (archivos.has(ref)) return archivos.get(ref);
    let destino = null;
    if (ref.startsWith('data:')) {
      const m = ref.match(/^data:([^;,]+);base64,(.*)$/s);
      if (!m) return null;
      destino = `assets/imagen-${++nImagen}.${EXT_MIME[m[1]] || 'bin'}`;
      entradas.push({ nombre: destino, datos: Buffer.from(m[2], 'base64') });
    } else {
      if (!base || /^(#|mailto:|tel:|https?:\/\/(?!localhost|127\.0\.0\.1))/i.test(ref)) return null;
      const url = new URL(ref, base);
      const prefijo = `/brands/${marca}/`;
      if (!url.pathname.startsWith(prefijo)) return null;
      const ruta = path.resolve(raizMarca, decodeURIComponent(url.pathname.slice(prefijo.length)));
      if (!ruta.startsWith(raizMarca + path.sep)) return null; // nunca fuera de la carpeta de la marca
      const nombre = path.basename(ruta);
      destino = `assets/${nombre}`;
      if (!entradas.some((e) => e.nombre === destino)) entradas.push({ nombre: destino, datos: await fs.readFile(ruta) });
    }
    archivos.set(ref, destino);
    return destino;
  };

  const refs = new Set();
  for (const m of salidaHtml.matchAll(/(?:src|href)="([^"]+)"/g)) refs.add(m[1]);
  for (const m of salidaHtml.matchAll(/url\("([^"]+)"\)/g)) refs.add(m[1]);
  for (const ref of refs) {
    const destino = await resolver(ref);
    if (destino) salidaHtml = salidaHtml.split(`"${ref}"`).join(`"${destino}"`);
  }
  // El script de ajuste es solo para piezas de tamaño fijo
  salidaHtml = salidaHtml.replace(/<script>[\s\S]*?window\.ajustarPieza[\s\S]*?<\/script>\s*/, '');
  entradas.unshift({ nombre: 'index.html', datos: Buffer.from(salidaHtml, 'utf8') });
  return crearZip(entradas);
}

export function pluginExportar() {
  return {
    name: 'fabrica-exportar',
    configureServer(server) {
      server.middlewares.use('/api/exportar', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end();
        }
        try {
          const datos = await leerJson(req);
          const { marca, archivo, ancho, alto, salida } = datos;
          if (!marcaSegura(marca) || !nombreSeguro(archivo)) throw new Error('Nombre de archivo o marca no válidos.');
          const { buffer, desborda } =
            salida === 'zip'
              ? { buffer: await empaquetarLanding({ html: datos.html, marca }), desborda: false }
              : await exportarPieza({
                  html: datos.html,
                  ancho: Number(ancho),
                  alto: Number(alto),
                  salida,
                  escala: datos.escala === 2 ? 2 : 1,
                });
          const carpeta = path.join(RAIZ_SALIDA, marca);
          await fs.mkdir(carpeta, { recursive: true });
          await fs.writeFile(path.join(carpeta, archivo), buffer);
          res.setHeader('Content-Type', { png: 'image/png', pdf: 'application/pdf', zip: 'application/zip' }[salida]);
          res.setHeader('X-Guardado-En', encodeURIComponent(`salida/${marca}/${archivo}`));
          res.setHeader('X-Desborda', desborda ? 'si' : 'no');
          res.end(buffer);
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    },
  };
}
