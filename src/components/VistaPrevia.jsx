import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Muestra la pieza a su tamaño real dentro de un iframe y la escala para que quepa.
// El documento se escribe una vez; después solo se reemplaza su contenido, sin parpadeo.
// Tras cada cambio se ejecuta el ajuste automático de la pieza y se informa el resultado.
// Con `fluido` (landing) la altura no es fija: se mide el documento y el lienzo crece con él.
export default function VistaPrevia({ documento, ancho, alto: altoBase, onAjuste, fluido = false }) {
  const [altoMedido, setAltoMedido] = useState(null);
  const alto = fluido && altoMedido ? altoMedido : altoBase;
  const marco = useRef(null);
  const iframe = useRef(null);
  const [escala, setEscala] = useState(0.5);

  useLayoutEffect(() => {
    const el = marco.current;
    if (!el) return;
    const ajustar = () => {
      const { width, height } = el.getBoundingClientRect();
      // Una página fluida se ajusta al ancho y se recorre con scroll
      setEscala(fluido ? Math.min((width - 48) / ancho, 1) : Math.min((width - 48) / ancho, (height - 48) / alto, 1));
    };
    ajustar();
    const ro = new ResizeObserver(ajustar);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ancho, alto, fluido]);

  useEffect(() => {
    const frame = iframe.current;
    const doc = frame?.contentDocument;
    if (!doc) return;
    const informar = () => {
      const win = frame.contentWindow;
      if (!win?.ajustarPieza) return;
      win.document.fonts.ready.then(() => {
        win.ajustarPieza();
        // body mide el contenido real (documentElement nunca baja del alto del iframe)
        if (fluido) setAltoMedido(Math.ceil(win.document.body.getBoundingClientRect().height));
        const d = win.document.documentElement.dataset;
        onAjuste?.({ factor: Number(d.ajuste || 1), desborda: d.desborda === 'si' });
      });
    };
    const nuevo = new DOMParser().parseFromString(documento, 'text/html');
    const cabeceraIgual = doc.head && doc.head.innerHTML === nuevo.head.innerHTML;
    if (cabeceraIgual) {
      doc.body.innerHTML = nuevo.body.innerHTML;
      // Las imágenes cambian la altura al cargar: se reajusta cuando terminan.
      const pendientes = [...doc.images].filter((im) => !im.complete);
      pendientes.forEach((im) => im.addEventListener('load', informar, { once: true }));
      informar();
    } else {
      doc.open();
      doc.write(documento);
      doc.close();
      informar();
    }
  }, [documento, onAjuste, fluido]);

  return (
    <div className={`escenario${fluido ? ' fluido' : ''}`} ref={marco}>
      <div className="lienzo" style={{ width: ancho * escala, height: alto * escala }}>
        <iframe
          ref={iframe}
          title="Vista previa de la pieza"
          style={{ width: ancho, height: alto, transform: `scale(${escala})` }}
        />
      </div>
      <span className="escala">{Math.round(escala * 100)} %</span>
    </div>
  );
}
