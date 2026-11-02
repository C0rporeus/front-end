/**
 * Rutas del detalle del blog.
 *
 * En producción, Firebase Hosting reenvía /blog/<id> a la API (Cloud Run,
 * firebase.json → rewrites), que construye la página en cada petición desde la
 * base de datos: el shell estático de /blog/articulo con el <title>, las meta
 * tags Open Graph y los datos del artículo incrustados. Nada del artículo se
 * genera en el build.
 *
 * En `next dev` no hay Hosting ni API delante, así que los enlaces apuntan al
 * shell con ?id=<id>.
 */
export const BLOG_DYNAMIC_SHELL_PATH = "/blog/articulo";

/** id del elemento <script type="application/json"> que incrusta la API (BlogArticleDataElementID). */
export const BLOG_ARTICLE_DATA_ELEMENT_ID = "__BLOG_ARTICLE__";

const BLOG_ARTICLE_PATH = /^\/blog\/([^/?#]+)\/?$/;

/** URL pública de un artículo. */
export function blogArticleHref(id: string, isDev = process.env.NODE_ENV === "development"): string {
  const encoded = encodeURIComponent(id);
  return isDev ? `${BLOG_DYNAMIC_SHELL_PATH}/?id=${encoded}` : `/blog/${encoded}/`;
}

/**
 * id del artículo a partir de la URL: /blog/<id>, /blog/<id>/ o, en desarrollo,
 * /blog/articulo/?id=<id>. "" para el índice del blog y el shell sin id.
 */
export function articleIdFromLocation(pathname: string, search = ""): string {
  const match = BLOG_ARTICLE_PATH.exec(pathname);
  if (!match) return "";
  const segment = decodeURIComponent(match[1]);
  if (`/blog/${segment}` !== BLOG_DYNAMIC_SHELL_PATH) return segment;
  return new URLSearchParams(search).get("id")?.trim() ?? "";
}
