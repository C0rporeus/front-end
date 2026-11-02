/**
 * Página base (shell) del detalle del blog.
 *
 * En producción la API la descarga y la completa en cada petición a /blog/<id>
 * (firebase.json → rewrites → Cloud Run): título, meta tags Open Graph y los
 * datos del artículo incrustados. El build no genera ninguna página por artículo.
 */
import BlogArticleView from "@/components/blog/BlogArticleView";

export default function BlogArticlePage() {
  return <BlogArticleView />;
}
