// Motor mínimo de templates (estilo mustache):
//   {{campo}}          texto escapado
//   {{{campo}}}        HTML sin escapar (logos SVG en línea)
//   {{#campo}}…{{/campo}}  bloque si hay valor; si es lista, se repite por elemento
//   {{^campo}}…{{/campo}}  bloque si NO hay valor
// Las rutas con punto (`logo.vertical.blanco`) leen objetos anidados.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapar = (v) => String(v).replace(/[&<>"']/g, (c) => ESC[c]);

function leer(ctx, ruta) {
  if (ruta === '.') return ctx['.'];
  return ruta.split('.').reduce((obj, k) => (obj == null ? undefined : obj[k]), ctx);
}

const tieneValor = (v) => (Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== false && v !== '' && v !== 0);

const SECCION = /\{\{([#^])\s*([\w.@]+)\s*\}\}([\s\S]*?)\{\{\/\s*\2\s*\}\}/g;

export function render(tpl, ctx) {
  let out = tpl.replace(SECCION, (_, tipo, ruta, interior) => {
    const v = leer(ctx, ruta);
    if (tipo === '^') return tieneValor(v) ? '' : render(interior, ctx);
    if (!tieneValor(v)) return '';
    if (Array.isArray(v)) {
      return v
        .map((item, i) =>
          render(interior, { ...ctx, ...(typeof item === 'object' ? item : { '.': item }), '@n': i + 1, '@nn': String(i + 1).padStart(2, '0') }),
        )
        .join('');
    }
    return render(interior, ctx);
  });
  out = out.replace(/\{\{\{\s*([\w.@]+)\s*\}\}\}/g, (_, r) => String(leer(ctx, r) ?? ''));
  out = out.replace(/\{\{\s*([\w.@]+)\s*\}\}/g, (_, r) => escapar(leer(ctx, r) ?? ''));
  return out;
}

// Prepara los datos del formulario para el template:
// - campos de opciones generan banderas `campo_valor` (p. ej. fondo_verde) para usar en {{#…}}
// - los textos con `largo` en el schema generan `campo_largo` cuando lo superan (para reducir el cuerpo)
// - las listas descartan elementos vacíos y exponen su cantidad en `campo_n` (para ajustar el layout)
export function contextoDesde(schema, valores) {
  const ctx = {};
  for (const campo of schema.campos) {
    let v = valores[campo.id];
    if (campo.tipo === 'lista') {
      v = (v || []).filter((item) => Object.values(item).some((x) => String(x ?? '').trim()));
      ctx[`${campo.id}_n`] = v.length;
      // Por elemento: banderas de sus selectores (diseno_foto) y viñetas de sus textos con `lineas`
      v = v.map((item) => {
        const extra = {};
        for (const s of campo.subcampos || []) {
          if (s.tipo === 'opciones') extra[`${s.id}_${item[s.id] || s.opciones[0].valor}`] = true;
          if (s.lineas && item[s.id]) extra[`${s.id}_lineas`] = String(item[s.id]).split('\n').map((l) => l.replace(/^[-•·]\s*/, '').trim()).filter(Boolean);
        }
        return { ...item, ...extra };
      });
    }
    if (typeof v === 'string') v = v.trim();
    // Enlaces: solo http(s), mailto, tel o anclas internas; cualquier otro esquema se descarta
    if (campo.formato === 'url' && v && !/^(https?:\/\/|mailto:|tel:|#)/i.test(v)) v = '';
    ctx[campo.id] = v;
    if (campo.tipo === 'opciones' && v) ctx[`${campo.id}_${v}`] = true;
    if (campo.largo && typeof v === 'string' && v.length > campo.largo) ctx[`${campo.id}_largo`] = true;
    // Textos largos: cada bloque separado por una línea en blanco es un párrafo ({{#campo_parrafos}}<p>{{.}}</p>{{/campo_parrafos}})
    if (campo.parrafos && typeof v === 'string') ctx[`${campo.id}_parrafos`] = v.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
  }
  return ctx;
}
