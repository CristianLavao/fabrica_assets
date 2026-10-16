import { useMemo, useState } from 'react';
import { CATALOGO, buscarOpcion, describirFormato } from './catalog.js';
import { MARCAS } from './lib/brands.js';
import { documentoPieza, valoresIniciales } from './lib/pieza.js';
import { nombreArchivo } from './lib/filename.js';
import { exportarYDescargar, SALIDAS_EXPORTABLES } from './lib/exportar.js';
import VistaPrevia from './components/VistaPrevia.jsx';
import Formulario from './components/Formulario.jsx';

const CLAVE_INICIAL = 'redes/post';

export default function App() {
  const [marcaId, setMarcaId] = useState(MARCAS[0]?.id);
  const [clave, setClave] = useState(CLAVE_INICIAL);
  // Contenido por marca y por opción: cambiar de opción no borra lo escrito.
  const [contenidos, setContenidos] = useState({});
  const [ajuste, setAjuste] = useState(null);
  // Estado de la exportación: null | { tipo: 'cargando' | 'ok' | 'error', ... }
  const [exportacion, setExportacion] = useState(null);

  const marca = MARCAS.find((m) => m.id === marcaId);
  const [categoriaId, opcionId] = clave.split('/');
  const { categoria, opcion } = buscarOpcion(categoriaId, opcionId);
  const template = marca?.templates[clave];
  const idContenido = `${marcaId}:${clave}`;
  const valores = template ? contenidos[idContenido] ?? valoresIniciales(template.schema) : null;

  const documento = useMemo(
    () => (template ? documentoPieza({ marca, opcion, template, valores }) : ''),
    [marca, opcion, template, valores],
  );

  const archivo = template
    ? nombreArchivo({
        categoria: categoria.id,
        tipo: opcion.id,
        // El schema puede indicar qué campo da nombre al archivo (p. ej. la cita en una quote card)
        titulo: valores[template.schema.archivo || 'titulo'],
        extension: opcion.salida,
      })
    : null;

  const faltantes = template ? template.schema.campos.filter((c) => c.requerido && !String(valores[c.id] ?? '').trim()) : [];
  const exportable = template && SALIDAS_EXPORTABLES.has(opcion.salida);
  const bloqueo = !exportable
    ? `La exportación ${opcion.salida.toUpperCase()} llega en una fase posterior.`
    : faltantes.length
      ? `Falta: ${faltantes.map((c) => c.label).join(', ')}.`
      : ajuste?.desborda
        ? 'El contenido no cabe. Acórtalo antes de descargar.'
        : null;

  const descargar = async () => {
    setExportacion({ tipo: 'cargando' });
    try {
      const r = await exportarYDescargar({ marca, opcion, documento, archivo });
      setExportacion({ tipo: 'ok', ...r });
    } catch (e) {
      setExportacion({ tipo: 'error', mensaje: e.message });
    }
  };

  if (!marca) {
    return <p className="vacio-total">No hay marcas en /brands. Agrega una carpeta con brand.json y su design system.</p>;
  }

  return (
    <div className="app">
      <header className="barra">
        <div className="marca-app">
          <span className="sello" aria-hidden="true" />
          <h1>Fábrica de assets</h1>
        </div>
        <label className="selector-marca">
          <span>Marca</span>
          <select id="marca" value={marcaId} onChange={(e) => setMarcaId(e.target.value)}>
            {MARCAS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </label>
        {marca.designSystem && (
          <a className="enlace-ds" href={marca.designSystem} target="_blank" rel="noreferrer">
            Design system
          </a>
        )}
      </header>

      <nav className="catalogo" aria-label="Tipos de asset">
        {CATALOGO.map((cat) => (
          <section key={cat.id}>
            <h2>{cat.nombre}</h2>
            <ul>
              {cat.opciones.map((op) => {
                const k = `${cat.id}/${op.id}`;
                const listo = Boolean(marca.templates[k]);
                return (
                  <li key={k}>
                    <button type="button" className={k === clave ? 'activo' : ''} aria-current={k === clave} onClick={() => { setClave(k); setExportacion(null); }}>
                      <span className="op-nombre">{op.nombre}</span>
                      <span className={`estado ${listo ? 'listo' : 'pendiente'}`}>{listo ? op.salida.toUpperCase() : 'Sin template'}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>

      <main className="centro">
        <div className="centro-cabecera">
          <div>
            <p className="migas">{categoria.nombre}</p>
            <h2>{opcion.nombre}</h2>
          </div>
          <p className="formato">{describirFormato(opcion)}</p>
        </div>

        {template ? (
          <VistaPrevia documento={documento} ancho={opcion.ancho} alto={opcion.alto} onAjuste={setAjuste} fluido={Boolean(opcion.responsive || opcion.paginas === 'varias')} />
        ) : (
          <div className="escenario sin-template">
            <div>
              <h3>{marca.nombre} todavía no tiene template para «{opcion.nombre}»</h3>
              <p>
                Se buscará primero en su design system de Claude Design. Si no existe, se diseña allí con sus tokens y queda guardado para
                reutilizarlo.
              </p>
            </div>
          </div>
        )}

        {template && ajuste?.desborda && (
          <p className="aviso error" role="status">
            El contenido no cabe en {opcion.ancho} × {opcion.alto} px ni reduciendo el texto. Acorta los textos o quita algún punto.
          </p>
        )}
        {template && ajuste && !ajuste.desborda && ajuste.factor < 1 && (
          <p className="aviso" role="status">
            Texto reducido al {Math.round(ajuste.factor * 100)} % para que todo quepa.
          </p>
        )}

        {template && (
          <div className="salida">
            <div className="archivo">
              <span>Archivo</span>
              <code>{archivo}</code>
            </div>
            <button
              type="button"
              className="descargar"
              disabled={Boolean(bloqueo) || exportacion?.tipo === 'cargando'}
              title={bloqueo || undefined}
              onClick={descargar}
            >
              {exportacion?.tipo === 'cargando' ? 'Generando…' : `Descargar ${opcion.salida.toUpperCase()}`}
            </button>
          </div>
        )}
        {template && bloqueo && <p className="aviso">{bloqueo}</p>}
        {template && exportacion?.tipo === 'ok' && (
          <p className="aviso ok" role="status">
            Descargado ({(exportacion.peso / 1024).toFixed(0)} KB).
            {exportacion.guardadoEn && (
              <>
                {' '}Copia guardada en <code>{exportacion.guardadoEn}</code>.
              </>
            )}
          </p>
        )}
        {template && exportacion?.tipo === 'error' && (
          <p className="aviso error" role="alert">
            No se pudo exportar: {exportacion.mensaje}
          </p>
        )}
      </main>

      <aside className="panel" aria-label="Contenido de la pieza">
        <h2>Contenido</h2>
        {template ? (
          <>
            <Formulario schema={template.schema} valores={valores} onChange={(v) => setContenidos((c) => ({ ...c, [idContenido]: v }))} />
            <button type="button" className="enlace restaurar" onClick={() => setContenidos((c) => ({ ...c, [idContenido]: valoresIniciales(template.schema) }))}>
              Volver al contenido de ejemplo
            </button>
            {template.meta.claudeDesign ? (
              <p className="origen">
                Diseño fuente en Claude Design:{' '}
                <a href={template.meta.claudeDesign} target="_blank" rel="noreferrer">
                  {[].concat(template.meta.artboard || 'abrir canvas').join(', ')}
                </a>
              </p>
            ) : (
              <p className="nota">Template provisional: todavía no está enlazado a Claude Design.</p>
            )}
          </>
        ) : (
          <p className="ayuda">El formulario aparece cuando el template está listo.</p>
        )}
      </aside>
    </div>
  );
}
