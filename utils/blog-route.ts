/**
 * Ruta del shell dinámico del blog. Firebase Hosting reescribe a esta página
 * cualquier /blog/<id> que no tenga HTML generado en el build (firebase.json),
 * así un artículo nuevo en la base de datos es visible sin reconstruir el sitio.
 */
export const BLOG_DYNAMIC_SHELL_PATH = "/blog/articulo";

const BLOG_ARTICLE_PATH = /^\/blog\/([^/?#]+)\/?$/;

/**
 * Devuelve el id del artículo a partir del pathname (/blog/<id> o /blog/<id>/).
 * Devuelve "" para el índice del blog y para la propia ruta del shell.
 */
export function articleIdFromPath(pathname: string): string {
  const match = BLOG_ARTICLE_PATH.exec(pathname);
  if (!match) return "";
  const id = decodeURIComponent(match[1]);
  return `/blog/${id}` === BLOG_DYNAMIC_SHELL_PATH ? "" : id;
}
