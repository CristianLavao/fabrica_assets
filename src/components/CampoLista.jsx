// Campo repetible: el usuario agrega (+), quita y reordena elementos.
// Cada elemento tiene los subcampos que define el schema. Con `compacto` se muestra en una sola fila.

import { leerImagenReducida } from '../lib/imagenes.js';

function vacio(campo) {
  return Object.fromEntries(campo.subcampos.map((s) => [s.id, '']));
}

export default function CampoLista({ campo, valor, onChange }) {
  const items = valor || [];
  const max = campo.max || 6;
  const nombre = campo.item || 'elemento';

  const editar = (i, clave, v) => onChange(items.map((it, j) => (j === i ? { ...it, [clave]: v } : it)));
  const quitar = (i) => onChange(items.filter((_, j) => j !== i));
  const mover = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const copia = [...items];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    onChange(copia);
  };
  const agregar = () => onChange([...items, vacio(campo)]);

  return (
    <div className={`lista ${campo.compacto ? 'compacta' : ''}`}>
      {items.map((it, i) => (
        <div className="lista-item" key={i}>
          {!campo.compacto && (
            <div className="lista-item-cabecera">
              <span className="lista-num">{String(i + 1).padStart(2, '0')}</span>
              <div className="lista-acciones">
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label={`Subir ${nombre} ${i + 1}`}>↑</button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === items.length - 1} aria-label={`Bajar ${nombre} ${i + 1}`}>↓</button>
                <button type="button" onClick={() => quitar(i)} aria-label={`Quitar ${nombre} ${i + 1}`}>×</button>
              </div>
            </div>
          )}
          <div className="lista-subcampos">
            {campo.subcampos.map((s) => {
              const id = `${campo.id}-${i}-${s.id}`;
              const v = it[s.id] ?? '';
              const props = {
                id,
                value: v,
                placeholder: s.placeholder || s.label,
                'aria-label': `${s.label} del ${nombre} ${i + 1}`,
                onChange: (e) => editar(i, s.id, e.target.value),
                className: s.max && v.length > s.max ? 'excede' : undefined,
              };
              if (s.tipo === 'opciones') {
                return (
                  <label key={s.id} className="lista-select">
                    <span>{s.label}</span>
                    <select id={id} value={v || s.opciones[0].valor} onChange={(e) => editar(i, s.id, e.target.value)}>
                      {s.opciones.map((o) => (
                        <option key={o.valor} value={o.valor}>{o.label}</option>
                      ))}
                    </select>
                  </label>
                );
              }
              if (s.tipo === 'imagen') {
                const leer = (archivo) => {
                  if (!archivo) return;
                  leerImagenReducida(archivo).then((v) => editar(i, s.id, v)).catch(() => {});
                };
                return (
                  <div key={s.id} className="lista-imagen">
                    <label htmlFor={id} className="soltar">
                      <input id={id} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => leer(e.target.files?.[0])} />
                      <span>{v ? (String(v).startsWith('data:') ? 'Foto cargada. Clic para cambiarla.' : 'Foto de ejemplo. Clic para usar la tuya.') : `${s.label}: elegir archivo`}</span>
                    </label>
                    {v && <button type="button" className="enlace" onClick={() => editar(i, s.id, '')}>Quitar foto</button>}
                  </div>
                );
              }
              return s.tipo === 'parrafo' ? <textarea key={s.id} rows={s.filas || 2} {...props} /> : <input key={s.id} {...props} />;
            })}
          </div>
          {campo.compacto && (
            <button type="button" className="quitar" onClick={() => quitar(i)} aria-label={`Quitar ${nombre} ${i + 1}`}>×</button>
          )}
        </div>
      ))}
      {items.length < max ? (
        <button type="button" className="agregar" onClick={agregar}>
          <span aria-hidden="true">+</span> Agregar {nombre}
        </button>
      ) : (
        <p className="ayuda">Máximo {max}.</p>
      )}
    </div>
  );
}
