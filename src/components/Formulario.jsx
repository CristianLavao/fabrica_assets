// Formulario generado desde el schema.json del template.

import CampoLista from './CampoLista.jsx';
import { leerImagenReducida } from '../lib/imagenes.js';

function Contador({ valor, max }) {
  if (!max) return null;
  const n = (valor || '').length;
  return <span className={`contador${n > max ? ' excede' : ''}`}>{n}/{max}</span>;
}

function CampoImagen({ campo, valor, onChange }) {
  const elegir = (archivo) => {
    if (!archivo) return;
    leerImagenReducida(archivo).then(onChange).catch(() => {});
  };
  const esSubida = typeof valor === 'string' && valor.startsWith('data:');
  return (
    <div className="imagen-campo">
      <label className="soltar" htmlFor={campo.id}>
        <input id={campo.id} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => elegir(e.target.files?.[0])} />
        {valor ? (
          <span>{esSubida ? 'Imagen cargada. Haz clic para cambiarla.' : 'Foto de ejemplo de la marca. Haz clic para usar la tuya.'}</span>
        ) : (
          <span>Elegir imagen (JPG, PNG o WebP)</span>
        )}
      </label>
      {valor && (
        <button type="button" className="enlace" onClick={() => onChange('')}>
          Quitar imagen
        </button>
      )}
    </div>
  );
}

export default function Formulario({ schema, valores, onChange }) {
  const set = (id, v) => onChange({ ...valores, [id]: v });
  return (
    <form className="formulario" onSubmit={(e) => e.preventDefault()}>
      {schema.campos.map((campo) => {
        const v = valores[campo.id];
        // `visibleSi`: el campo solo aparece cuando otro campo (p. ej. una lista) tiene contenido
        if (campo.visibleSi) {
          const ref = valores[campo.visibleSi];
          if (!(Array.isArray(ref) ? ref.length : ref)) return null;
        }
        return (
          <div className="campo" key={campo.id}>
            <div className="campo-cabecera">
              <label htmlFor={campo.tipo === 'lista' ? `${campo.id}-0-${campo.subcampos[0].id}` : campo.id}>
                {campo.label}
                {campo.requerido && <span className="req"> *</span>}
              </label>
              {(campo.tipo === 'texto' || campo.tipo === 'parrafo') && <Contador valor={v} max={campo.max} />}
            </div>
            {campo.tipo === 'texto' && <input id={campo.id} value={v || ''} onChange={(e) => set(campo.id, e.target.value)} />}
            {campo.tipo === 'parrafo' && <textarea id={campo.id} rows={3} value={v || ''} onChange={(e) => set(campo.id, e.target.value)} />}
            {campo.tipo === 'opciones' && (
              <div
                className="segmentado"
                role="radiogroup"
                aria-label={campo.label}
                id={campo.id}
                style={{ gridTemplateColumns: `repeat(${campo.opciones.length <= 3 ? campo.opciones.length : 2}, minmax(0, 1fr))` }}
              >
                {campo.opciones.map((o) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={v === o.valor}
                    key={o.valor}
                    className={v === o.valor ? 'activo' : ''}
                    onClick={() => set(campo.id, o.valor)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
            {campo.tipo === 'lista' && <CampoLista campo={campo} valor={v} onChange={(nv) => set(campo.id, nv)} />}
            {campo.tipo === 'imagen' && <CampoImagen campo={campo} valor={v} onChange={(nv) => set(campo.id, nv)} />}
            {campo.ayuda && <p className="ayuda">{campo.ayuda}</p>}
          </div>
        );
      })}
    </form>
  );
}
