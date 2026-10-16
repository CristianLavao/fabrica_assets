// Catálogo de la fábrica: categorías y opciones de asset, comunes a todas las marcas.
// `id` de categoría y de opción forman el nombre del archivo: [categoria]-[tipo]-[fecha]-[titulo].
// Las medidas de Carta se expresan en px a 96 dpi (8.5×11 in = 816×1056 px).

export const CATALOGO = [
  {
    id: 'redes',
    nombre: 'Redes sociales',
    opciones: [
      { id: 'post', nombre: 'Post cuadrado', ancho: 1080, alto: 1080, salida: 'png' },
      { id: 'quote', nombre: 'Quote card', ancho: 1080, alto: 1080, salida: 'png' },
      { id: 'banner', nombre: 'Banner horizontal', ancho: 1500, alto: 500, salida: 'png' },
      { id: 'historia', nombre: 'Historia vertical', ancho: 1080, alto: 1920, salida: 'png' },
    ],
  },
  {
    id: 'linkedin',
    nombre: 'LinkedIn',
    opciones: [
      { id: 'post', nombre: 'Post con enlace', ancho: 1200, alto: 627, salida: 'png' },
      { id: 'banner', nombre: 'Banner de página', ancho: 1584, alto: 396, salida: 'png' },
      // Cada página mide 1080×1350 (4:5); LinkedIn lo publica como documento deslizable
      { id: 'carrusel', nombre: 'Carrusel (documento)', ancho: 1080, alto: 1350, salida: 'pdf', paginas: 'varias' },
    ],
  },
  {
    id: 'comercial',
    nombre: 'Comercial',
    opciones: [
      { id: 'propuesta', nombre: 'Oferta / propuesta', ancho: 816, alto: 1056, salida: 'pdf', paginas: 'varias', medida: 'Carta' },
      { id: 'onepager', nombre: 'One-pager de servicio', ancho: 816, alto: 1056, salida: 'pdf', medida: 'Carta' },
      { id: 'carta', nombre: 'Documento formal (membrete)', ancho: 816, alto: 1056, salida: 'pdf', paginas: 'varias', medida: 'Carta' },
    ],
  },
  {
    id: 'presentaciones',
    nombre: 'Presentaciones',
    opciones: [
      { id: 'deck', nombre: 'Deck corto (5–8 slides)', ancho: 1920, alto: 1080, salida: 'pdf', paginas: 'varias' },
      { id: 'portada', nombre: 'Portada de presentación', ancho: 1920, alto: 1080, salida: 'pdf' },
    ],
  },
  {
    id: 'especial',
    nombre: 'Especial',
    opciones: [
      { id: 'landing', nombre: 'Landing de campaña', ancho: 1440, alto: 2400, salida: 'zip', responsive: true },
    ],
  },
];

export function buscarOpcion(categoriaId, opcionId) {
  const categoria = CATALOGO.find((c) => c.id === categoriaId);
  const opcion = categoria?.opciones.find((o) => o.id === opcionId);
  return opcion ? { categoria, opcion } : null;
}

export function describirFormato(opcion) {
  const medida = opcion.medida ? `${opcion.medida} · ` : '';
  const tam = opcion.responsive ? 'Responsive' : `${opcion.ancho} × ${opcion.alto} px`;
  return `${medida}${tam} · ${opcion.salida.toUpperCase()}`;
}
