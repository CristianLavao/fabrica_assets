FIRENZE S.A.S. gestiona proyectos de ingeniería de forma integral: diseño vanguardista, soluciones sostenibles y tecnología avanzada. La identidad comunica **innovación, excelencia, sostenibilidad y confiabilidad**. Cada pieza debe sentirse técnica, estructurada y permanente, nunca decorativa.

## Voz y contenido

- Habla en primera persona plural: "Transformamos ideas en realidad", "Proyectos que inspiran, sueños que perduran".
- Frases cortas y afirmativas. Verbos de acción: transformar, construir, gestionar, diseñar.
- El nombre se escribe **FIRENZE** en mayúsculas. La razón social completa es **FIRENZE S.A.S.** y el NIT es **901.907.766-5**.
- Sin emojis, sin signos de exclamación y sin superlativos vacíos. Los datos (m², años, proyectos entregados) convencen más que los adjetivos.
- Las etiquetas (`eyebrow`) van en MAYÚSCULAS, igual que en el manual: "PERFIL DE MARCA", "APLICACIONES".
- Datos de contacto oficiales: firenzegrupoempresarial@gmail.com · (+57) 300 908 30 32 · @firenzesas · www.firenze.com.

## Color

- `castleton-green` es el color de la marca. Usa como mínimo un bloque de este color en cada pieza, o el logo en este color.
- Combinaciones aprobadas por el manual (logo y texto sobre fondo):
  - `white` sobre `castleton-green`
  - `tea-green` sobre `oxford-blue`
  - `oxford-blue` sobre `tea-green`
  - `castleton-green` sobre `white`
  - `lapis-lazuli` sobre `oxford-blue`, **solo para el logo**: el contraste es de 2.7:1 y no sirve para texto.
- `light-sea-green` es el acento. Úsalo en líneas, cifras clave e iconos, pero nunca como fondo de texto pequeño. Como texto sobre blanco, solo a 24px o más.
- `tea-green` es el color de relieve: fondos claros, resaltados y texto sobre los fondos oscuros.
- En la interfaz y en los documentos, construye con los tokens semánticos: `surface`, `surface-alt`, `ink`, `ink-muted`, `line`, `brand-text`, `brand-fill`, `on-brand`.
- No hagas degradados entre colores de marca. Sobre fotografía solo se permite un velo plano de `castleton-green` u `oxford-blue` (ver componente FotoVelo).
- Los valores RGB y CMYK del manual tienen errores de transcripción. Los valores válidos son siempre los HEX de estos tokens.

## Tipografía

- **Simplo** (`display`) para títulos: Medium (500) en `display`, `h1` y `h2`; Bold (700) en acentos: `h3`, `eyebrow` y `dato`.
- **Codec Pro** (`body`) para todo el texto corrido: `body-lg`, `body` y `caption`. Solo existe en Regular. Para enfatizar dentro del texto, cambia a Simplo Bold en vez de forzar la negrita.
- Los títulos van en frase (sin MAYÚSCULAS completas), alineados a la izquierda, con `text-wrap: balance`.
- Máximo dos tamaños de título por pieza.

## Logotipo

- Hay tres versiones: **horizontal** (la principal), **vertical** (para formatos altos y cuadrados) e **isotipo** (avatar, favicon, sello, marca de agua).
- Cada versión existe en cinco tintas (`verde`, `blanco`, `tea`, `lapis`, `oxford`). Elige la tinta según las combinaciones aprobadas de la sección Color.
- **Área de protección:** deja libre alrededor del logo, como mínimo, la altura de la "F" del nombre. **Tamaño mínimo:** 120px de ancho para el horizontal y 32px para el isotipo.
- No deformes el logo, no le cambies los colores fuera de las cinco tintas, no le pongas sombras ni lo coloques sobre zonas de foto con mucho detalle.
- La "hoja" (`firenze-hoja-*`) es un fragmento del isotipo. Úsala como detalle gráfico pequeño, nunca en lugar del logo.
- **El nombre FIRENZE nunca se escribe con una fuente** cuando funciona como título o como firma (portadas, encabezados, cierres, hero de la landing, patrón). Usa siempre `firenze-nombre-*` (componente Nombre): son las letras exactas del logotipo. En texto corrido sí se escribe con la fuente del párrafo.

## Patrón y gráfica

- Patrón tipográfico: el nombre FIRENZE (`firenze-nombre-*`) repetido en filas desplazadas, tal como aparece en la papelería del manual. Se usa en `tea-green` sobre `castleton-green`, o en `line` sobre `surface`, al 10–20 % de la composición y nunca detrás de texto.
- Gráfica estructural: las franjas horizontales y las columnas verticales del isotipo. Se usan como estructura de la composición: el filete de `light-sea-green` que separa foto y texto, o franjas grandes que salen a sangre por el borde de la pieza. **Nunca como un grupo pequeño de líneas en una esquina:** se confunde con el icono de menú y repite el isotipo.
- Un solo gesto de marca por pieza: el isotipo, el nombre (`firenze-nombre-*`) o una franja estructural, nunca los tres a la vez.

## Fotografía

- Temas: obra, planos, arquitectura en contrapicado, edificios terminados y personas trabajando con planos. Luz natural y cielos limpios.
- Se encuadra a sangre y con `radius-none`. El texto sobre una foto va siempre encima de un velo de color de marca, nunca directamente sobre la imagen.
- **Tratamiento de color (duotono de marca):** toda foto de banco o de fuentes distintas se pasa a escala de grises y se remapea a los colores de marca, para que el conjunto se vea como un solo archivo fotográfico:
  - **Verde (por defecto):** sombras en `oxford-blue`, medios en `castleton-green` y luces en `tea-green`.
  - **Azul:** sombras en `oxford-blue`, medios en `lapis-lazuli` y luces en `white`.
  - **Original:** solo para fotos propias de obra con buen color.
  Se aplica como filtro SVG (`feColorMatrix` a grises más `feComponentTransfer` con tres pasos por canal) sobre la imagen, sin tocar el archivo.

## Espaciado y layout

- Retícula de 8px. Usa los pasos de `space-1` a `space-7`.
- Márgenes de seguridad: `space-6` (64px) en piezas de 1080px, `space-7` (96px) en slides de 1920×1080 y 0.75in en documentos tamaño Carta.
- Esquinas rectas (`radius-none`) por defecto. `radius-round` queda reservado para el sello circular del isotipo.
- Sin sombras. La profundidad se marca con bloques de color.

## Formatos de producción

| Pieza | Tamaño | Logo recomendado |
| --- | --- | --- |
| Post cuadrado, quote card | 1080×1080 px | vertical o isotipo |
| Historia vertical | 1080×1920 px | vertical |
| Banner horizontal | 1500×500 px | horizontal |
| Slides y portada | 1920×1080 px (16:9) | horizontal |
| Propuesta y one-pager | Carta 8.5×11 in | horizontal |
| Landing | responsive | horizontal |
