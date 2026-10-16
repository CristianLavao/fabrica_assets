// Las fotos subidas se reducen en el navegador antes de usarlas: una foto de celular de 8–12 MB
// pasa a ~0,3–0,8 MB sin pérdida visible en piezas de hasta 1920 px, y la exportación no supera
// el límite de tamaño de la función en la nube (4,5 MB por petición).

const LADO_MAXIMO = 2400;
const CALIDAD = 0.86;

export function leerImagenReducida(archivo) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, LADO_MAXIMO / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.round(img.naturalWidth * escala);
      const h = Math.round(img.naturalHeight * escala);
      const lienzo = document.createElement('canvas');
      lienzo.width = w;
      lienzo.height = h;
      const ctx = lienzo.getContext('2d');
      // PNG con transparencia se conserva en PNG; lo demás pasa a JPEG
      const conAlfa = archivo.type === 'image/png';
      if (!conAlfa) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(lienzo.toDataURL(conAlfa ? 'image/png' : 'image/jpeg', CALIDAD));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen.'));
    };
    img.src = url;
  });
}
