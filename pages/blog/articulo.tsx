/**
 * Shell dinámico del detalle del blog.
 *
 * Firebase Hosting sirve esta página (firebase.json → rewrites) para cualquier
 * /blog/<id> sin HTML generado en el build. Reutiliza la página de detalle sin
 * props estáticos: el id se toma de la URL y el artículo se pide a la API.
 */
import BlogDetailPage from "./[id]";

export default function BlogDynamicArticlePage() {
  return <BlogDetailPage article={null} related={[]} ogImage="" />;
}
