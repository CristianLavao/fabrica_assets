// [categoria]-[tipo]-[fecha]-[titulo-corto]: minúsculas, sin tildes, máximo 5 palabras de título.

const VACIAS = new Set(['de', 'la', 'el', 'los', 'las', 'y', 'en', 'para', 'con', 'un', 'una', 'del', 'al', 'que', 'a', 'o']);

export function slug(texto, maxPalabras = 5) {
  const palabras = String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  const utiles = palabras.filter((p) => !VACIAS.has(p));
  return (utiles.length ? utiles : palabras).slice(0, maxPalabras).join('-');
}

export function fechaHoy(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function nombreArchivo({ categoria, tipo, titulo, extension, fecha = fechaHoy() }) {
  const t = slug(titulo) || 'sin-titulo';
  return `${categoria}-${tipo}-${fecha}-${t}.${extension}`;
}
