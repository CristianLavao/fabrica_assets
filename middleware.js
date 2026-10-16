// Protección del sitio publicado (Vercel Routing Middleware): pide usuario y contraseña antes de
// mostrar la app, las fuentes, los logos o la exportación. La app sigue sin login propio.
// Se configura con las variables de entorno FABRICA_USUARIO y FABRICA_CLAVE en Vercel.
// Si faltan, el sitio queda cerrado (nunca abierto por error).
import { next } from '@vercel/functions';

export const config = { matcher: '/:path*' };

function iguales(a, b) {
  // Comparación en tiempo constante para no filtrar la clave por tiempos de respuesta
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferencia === 0;
}

export default function middleware(request) {
  const usuario = process.env.FABRICA_USUARIO;
  const clave = process.env.FABRICA_CLAVE;
  if (!usuario || !clave) {
    // Dice qué variable falta (nunca su valor) para poder corregirlo en Vercel
    const faltan = [!usuario && 'FABRICA_USUARIO', !clave && 'FABRICA_CLAVE'].filter(Boolean).join(' y ');
    const entorno = process.env.VERCEL_ENV || 'desconocido';
    return new Response(
      `La fábrica no tiene credenciales configuradas. Falta: ${faltan} (entorno: ${entorno}).\n` +
        'Revisa en Vercel › Settings › Environment Variables que exista con ese nombre exacto y marcada para este entorno, y vuelve a desplegar.',
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }
  const cabecera = request.headers.get('authorization') || '';
  if (cabecera.startsWith('Basic ')) {
    let decodificado = '';
    try {
      decodificado = atob(cabecera.slice(6));
    } catch {
      decodificado = '';
    }
    const i = decodificado.indexOf(':');
    if (i > 0 && iguales(decodificado.slice(0, i), usuario) && iguales(decodificado.slice(i + 1), clave)) {
      return next();
    }
  }
  return new Response('Acceso restringido.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Fabrica de assets", charset="UTF-8"' },
  });
}
