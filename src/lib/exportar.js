// Pide al servidor local la pieza exportada (PNG o PDF) y la descarga con su nombre organizado.

export const SALIDAS_EXPORTABLES = new Set(['png', 'pdf', 'zip']);

export async function exportarYDescargar({ marca, opcion, documento, archivo }) {
  const r = await fetch('/api/exportar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      marca: marca.id,
      archivo,
      ancho: opcion.ancho,
      alto: opcion.alto,
      salida: opcion.salida,
      html: documento,
    }),
  });
  if (!r.ok) {
    const { error } = await r.json().catch(() => ({ error: `Error ${r.status}` }));
    throw new Error(error || 'No se pudo exportar la pieza.');
  }
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = archivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return {
    guardadoEn: decodeURIComponent(r.headers.get('X-Guardado-En') || ''),
    peso: blob.size,
  };
}
