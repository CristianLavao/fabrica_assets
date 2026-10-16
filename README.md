# Fábrica de assets

Herramienta de producción para generar piezas de marca (redes, LinkedIn, comercial, presentaciones y landing) con el diseño real de cada cliente. Sin login ni base de datos. El acceso al sitio publicado se protege con usuario y contraseña.

## Uso local

```bash
npm install
npm run dev
```

Abre http://localhost:5173. Las exportaciones usan el Edge o Chrome instalado y dejan una copia en `salida/<marca>/`.

## Estructura

| Carpeta | Qué contiene |
| --- | --- |
| `src/` | La app: catálogo, formulario, vista previa y descarga |
| `brands/<marca>/` | Todo lo de una marca: `brand.json`, design system (`ds/project`), `templates/<categoría>/<tipo>/` y `efectos.html` |
| `server/exportar.js` | Exportación PNG/PDF/ZIP, compartida entre local y Vercel |
| `api/exportar.js` | Función de Vercel que expone la exportación |
| `middleware.js` | Usuario y contraseña delante de todo el sitio publicado |

Cada template tiene `template.html`, `schema.json` (los campos del formulario) y `meta.json` (su canvas de origen en Claude Design).

## Publicar en Vercel (subdominio)

1. Sube el repositorio a GitHub como **privado**: contiene fuentes comerciales y material del cliente.
2. En Vercel: *Add New → Project*, importa el repositorio. La configuración ya está en `vercel.json`, así que no hay que cambiar nada en el formulario.
3. En *Settings → Environment Variables* agrega `FABRICA_USUARIO` y `FABRICA_CLAVE`. Sin ellas el sitio responde «sin credenciales configuradas» y no se abre.
4. En *Settings → Domains* agrega `fabrica.cristianlavaob.co`. Si el dominio ya está en Vercel, queda listo; si no, crea el registro CNAME que indica Vercel.

### Límites de la versión en la nube

- Una exportación puede tardar hasta 60 s. Un deck con muchas fotos es lo más pesado.
- El archivo descargado y lo que se envía a exportar deben quedar por debajo de 4,5 MB. Por eso las fotos subidas se reducen en el navegador a un máximo de 2400 px.
- En la nube no se guarda copia en `salida/`: el archivo solo se descarga.

## Licencias

Las fuentes de cada marca (en FIRENZE: Simplo y Codec Pro) se sirven en la web publicada. Antes de publicar, confirma que la licencia de la marca permite uso web, o limita el acceso a las personas autorizadas.

## Una fábrica para un cliente

Para entregarle a un cliente su propia fábrica, publica una copia del repositorio que contenga solo su carpeta `brands/<cliente>`, en otro proyecto de Vercel y con sus propias credenciales.
