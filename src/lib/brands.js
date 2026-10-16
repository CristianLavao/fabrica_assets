// Carga cada marca de /brands: su configuración, los tokens de su design system,
// sus logos (SVG en línea) y sus templates. Agregar una marca = agregar una carpeta.

import { tokensACss } from './tokens.js';

const configs = import.meta.glob('/brands/*/brand.json', { eager: true, import: 'default' });
const tokensPorMarca = import.meta.glob('/brands/*/ds/project/tokens.json', { eager: true, import: 'default' });
const logosSvg = import.meta.glob('/brands/*/ds/project/assets/Logos/*.svg', { eager: true, query: '?raw', import: 'default' });
const iconosSvg = import.meta.glob('/brands/*/ds/project/assets/Icons/*.svg', { eager: true, query: '?raw', import: 'default' });
// Efectos opcionales de la marca (p. ej. filtros SVG para el tratamiento de fotos)
const efectos = import.meta.glob('/brands/*/efectos.html', { eager: true, query: '?raw', import: 'default' });
const plantillas =import.meta.glob('/brands/*/templates/*/*/template.html', { eager: true, query: '?raw', import: 'default' });
const schemas = import.meta.glob('/brands/*/templates/*/*/schema.json', { eager: true, import: 'default' });
const metas = import.meta.glob('/brands/*/templates/*/*/meta.json', { eager: true, import: 'default' });

const idDeRuta = (ruta) => ruta.split('/')[2];

// Los SVG exportados de Illustrator comparten nombres de clase (.cls-1): al ponerlos
// varios en una misma página se pisarían los colores. Se prefijan por archivo.
function aislarSvg(svg, prefijo) {
  return svg.replace(/cls-/g, `${prefijo}-cls-`).replace(/<\?xml[^>]*>/, '');
}

function svgsPorForma(glob, id) {
  const mapa = {};
  for (const [ruta, svg] of Object.entries(glob)) {
    if (idDeRuta(ruta) !== id) continue;
    const archivo = ruta.split('/').pop().replace('.svg', '');
    const partes = archivo.replace(`${id}-`, '').split('-');
    const tinta = partes.pop();
    const forma = partes.join('-');
    mapa[forma] ??= {};
    mapa[forma][tinta] = aislarSvg(svg, archivo);
  }
  return mapa;
}

function cargarMarca(id, config) {
  const base = `/brands/${id}/`;
  const tokens = tokensPorMarca[`/brands/${id}/ds/project/tokens.json`];
  const templates = {};
  for (const [ruta, html] of Object.entries(plantillas)) {
    if (idDeRuta(ruta) !== id) continue;
    const [, , , , categoria, tipo] = ruta.split('/');
    const dir = ruta.replace('template.html', '');
    templates[`${categoria}/${tipo}`] = {
      html,
      schema: schemas[`${dir}schema.json`],
      meta: metas[`${dir}meta.json`] || {},
    };
  }
  return {
    ...config,
    base,
    tokens,
    css: tokens ? tokensACss(tokens, `${base}ds/project/`, config.tema) : '',
    efectos: efectos[`/brands/${id}/efectos.html`] || '',
    logo: svgsPorForma(logosSvg, id),
    icono: svgsPorForma(iconosSvg, id),
    templates,
  };
}

export const MARCAS = Object.entries(configs)
  .map(([ruta, config]) => cargarMarca(idDeRuta(ruta), config))
  .sort((a, b) => a.nombre.localeCompare(b.nombre));
