// Convierte el tokens.json del design system (Claude Design) en CSS para las piezas:
// @font-face, variables de color/espaciado/radio y una clase por estilo tipográfico.
// Es la única fuente de valores: los templates solo usan var(--…) y estas clases.

export function tokensACss(tokens, baseUrl, tema) {
  const primerTema = tema || tokens.color.themes[0].id;
  const valor = (t) => (typeof t.value === 'string' ? t.value : t.value[primerTema] ?? Object.values(t.value)[0]);
  const alias = (v) => (/^\{.+\}$/.test(v) ? `var(--${v.slice(1, -1)})` : v);

  const fuentes = tokens.type.fonts
    .map((f) => `@font-face{font-family:"${f.family}";font-weight:${f.weight};font-style:${f.style || 'normal'};font-display:block;src:url("${baseUrl}${f.file}") format("woff2");}`)
    .join('\n');

  const vars = [
    ...tokens.color.tokens.map((t) => `--${t.name}:${alias(valor(t))};`),
    ...Object.entries(tokens.type.families).map(([k, v]) => `--font-${k}:${v};`),
    ...['spacing', 'radius'].flatMap((fam) => (tokens[fam]?.tokens || []).map((t) => `--${t.name}:${t.value};`)),
  ].join('');

  const clases = tokens.type.groups
    .flatMap((g) =>
      g.styles.map((s) => {
        const fam = s.family || g.family;
        const reglas = [
          `font-family:var(--font-${fam})`,
          `font-size:${s.fontSize}`,
          `line-height:${s.lineHeight}`,
          `font-weight:${s.fontWeight}`,
          s.letterSpacing ? `letter-spacing:${s.letterSpacing}` : '',
        ].filter(Boolean);
        return `.${s.name}{${reglas.join(';')}}`;
      }),
    )
    .join('\n');

  return `${fuentes}\n:root{${vars}}\n${clases}`;
}
