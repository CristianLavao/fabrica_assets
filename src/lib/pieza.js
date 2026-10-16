// Arma el documento HTML completo de una pieza: fuentes y tokens de la marca + template renderizado.
// La vista previa y la exportación (fase 2) usan exactamente este mismo documento.

import { render, contextoDesde } from './render.js';

// Por debajo de este factor el texto dejaría de leerse bien en redes: se avisa en vez de seguir reduciendo.
export const AJUSTE_MINIMO = 0.62;

export function documentoPieza({ marca, opcion, template, valores, origen = window.location.origin }) {
  const ctx = {
    ...contextoDesde(template.schema, valores),
    marca: { nombre: marca.nombre, tagline: marca.tagline },
    contacto: marca.contacto,
    logo: marca.logo,
    icono: marca.icono,
  };
  const cuerpo = render(template.html, ctx);
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${(template.meta?.nombre || marca.nombre).replace(/[<&]/g, '')}</title>
<base href="${origen}${marca.base}">
<style>
${marca.css}
html,body{margin:0;padding:0;background:transparent}
body{${opcion.responsive ? '' : `width:${opcion.ancho}px;`}-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
*{box-sizing:border-box}
</style>
<script>
// Ajuste automático: si el contenido no cabe en el formato, el elemento [data-ajustar]
// reduce su variable --ajuste (que escala tipografía y espacios del template) hasta que cabe.
// Paginación: en un documento con [data-paginar] (una .pagina con su zona .flujo), los bloques
// que no caben pasan a copias de esa página (mismo membrete); un párrafo se parte por palabras.
window.paginarPieza = function () {
  var fuente = document.querySelector('[data-paginar]');
  if (!fuente || fuente.dataset.paginado) return;
  fuente.dataset.paginado = '1';
  var flujo = fuente.querySelector('.flujo');
  var bloques = Array.prototype.slice.call(flujo.children);
  var molde = fuente.cloneNode(true);
  molde.removeAttribute('data-paginar');
  molde.classList.add('continuacion');
  molde.querySelector('.flujo').innerHTML = '';
  flujo.innerHTML = '';
  var paginas = [fuente];
  var desborda = function () { return flujo.scrollHeight > flujo.clientHeight + 1; };
  var nuevaPagina = function () {
    var anterior = flujo;
    var p = molde.cloneNode(true);
    paginas[paginas.length - 1].after(p);
    paginas.push(p);
    flujo = p.querySelector('.flujo');
    // Un título (.con-siguiente) nunca queda solo al pie: pasa a la página nueva con su contenido
    var arrastre = [];
    while (anterior.lastElementChild && anterior.lastElementChild.classList.contains('con-siguiente') && anterior.children.length > 1) {
      arrastre.unshift(anterior.lastElementChild); anterior.lastElementChild.remove();
    }
    arrastre.forEach(function (el) { flujo.appendChild(el); });
  };
  var partir = function (bloque) {
    // Deja en la página actual tantas palabras como quepan; devuelve el resto como bloque nuevo
    var palabras = bloque.textContent.split(' ');
    var lo = 0, hi = palabras.length;
    while (lo < hi) {
      var mid = Math.ceil((lo + hi) / 2);
      bloque.textContent = palabras.slice(0, mid).join(' ');
      if (desborda()) hi = mid - 1; else lo = mid;
    }
    if (lo === 0) { bloque.remove(); bloque.textContent = palabras.join(' '); return bloque; }
    bloque.textContent = palabras.slice(0, lo).join(' ');
    var resto = bloque.cloneNode(false);
    resto.textContent = palabras.slice(lo).join(' ');
    return resto;
  };
  for (var i = 0; i < bloques.length; i++) {
    var b = bloques[i], guarda = 0;
    flujo.appendChild(b);
    while (desborda() && guarda++ < 40) {
      var partible = b.tagName === 'P' && b.childElementCount === 0;
      if (partible && flujo.children.length > 0) {
        var resto = partir(b);
        nuevaPagina();
        flujo.appendChild(resto);
        b = resto;
      } else {
        b.remove(); nuevaPagina(); flujo.appendChild(b);
        if (desborda()) break; // un bloque que no cabe ni solo en una página
      }
    }
  }
  paginas.forEach(function (p, n) {
    var num = p.querySelector('.num-pagina');
    if (num) num.textContent = paginas.length > 1 ? 'Página ' + (n + 1) + ' de ' + paginas.length : '';
  });
};
window.ajustarPieza = function () {
  window.paginarPieza();
  var p = document.querySelector('[data-ajustar]');
  if (!p) return 1;
  var k = 1, i = 0;
  p.style.setProperty('--ajuste', '1');
  while (p.scrollHeight > p.clientHeight + 1 && k > ${AJUSTE_MINIMO} && i < 30) {
    k = Math.max(${AJUSTE_MINIMO}, k - 0.03); i++;
    p.style.setProperty('--ajuste', k.toFixed(2));
  }
  document.documentElement.dataset.ajuste = k.toFixed(2);
  document.documentElement.dataset.desborda = p.scrollHeight > p.clientHeight + 1 ? 'si' : 'no';
  return k;
};
document.addEventListener('DOMContentLoaded', function () { document.fonts.ready.then(window.ajustarPieza); });
</script>
</head>
<body>${marca.efectos}${cuerpo}</body>
</html>`;
}

export function valoresIniciales(schema) {
  const v = {};
  for (const campo of schema.campos) {
    if (campo.ejemplo !== undefined) v[campo.id] = structuredClone(campo.ejemplo);
    else v[campo.id] = campo.tipo === 'lista' ? [] : '';
  }
  return v;
}
