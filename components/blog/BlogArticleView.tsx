import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { listPublicExperiencesFresh } from "@/api/experiences";
import LandingHeader from "@/components/layout/landing/LandingHeader";
import ErrorAlert from "@/components/UI/ErrorAlert";
import RichTextViewer from "@/components/UI/RichTextViewer";
import { Experience } from "@/interfaces/Experience";
import { BLOG_ARTICLE_DATA_ELEMENT_ID, articleIdFromLocation, blogArticleHref } from "@/utils/blog-route";
import { filterByKind } from "@/utils/content-kind";
import { extractFirstImageFromHtml, removeFirstImageFromHtml, stripHtml } from "@/utils/html-content";

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/** Hasta 4 artículos relacionados: primero por tags compartidos, luego los más recientes. */
export function selectRelated(article: Experience, blogEntries: Experience[]): Experience[] {
  const currentTags = new Set(article.tags.map(normalizeText));
  const ranked = blogEntries
    .filter((item) => item.id !== article.id)
    .map((item) => ({ item, score: item.tags.map(normalizeText).filter((tag) => currentTags.has(tag)).length }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.item.createdAt.localeCompare(a.item.createdAt))
    .map((entry) => entry.item)
    .slice(0, 4);
  if (ranked.length > 0) return ranked;
  return blogEntries.filter((item) => item.id !== article.id).slice(0, 4);
}

/**
 * Artículo incrustado por la API (GET /blog/:id) en <script type="application/json">.
 * Devuelve null si no existe, no es válido o corresponde a otro id.
 */
export function readEmbeddedArticle(id: string, doc: Document = document): Experience | null {
  const element = doc.getElementById(BLOG_ARTICLE_DATA_ELEMENT_ID);
  if (!element?.textContent) return null;
  try {
    const data = JSON.parse(element.textContent) as Experience;
    if (!data || data.id !== id) return null;
    return {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags : [],
      imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
    };
  } catch {
    return null;
  }
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

/** Primera imagen disponible: imageUrls[] → imagen embebida en body HTML */
const resolveHeroImage = (item: Experience): string =>
  item.imageUrls.find((url) => typeof url === "string" && url.trim().length > 0) ??
  extractFirstImageFromHtml(item.body ?? "") ??
  "";

/**
 * Detalle de un artículo del blog, construido con la respuesta del backend.
 *
 * El servidor (GET /blog/:id en la API) entrega el HTML con las meta tags del
 * artículo y sus datos incrustados, así que se pinta sin otra petición; los
 * relacionados se cargan después. Si los datos no vienen incrustados (por
 * ejemplo en `next dev`), el artículo se pide a la API por el id de la URL.
 */
export default function BlogArticleView() {
  const [article, setArticle] = useState<Experience | null>(null);
  const [related, setRelated] = useState<Experience[]>([]);
  const [loadedHeroImage, setLoadedHeroImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const id = articleIdFromLocation(window.location.pathname, window.location.search);
    const embedded = id ? readEmbeddedArticle(id) : null;
    if (embedded) {
      setArticle(embedded);
      setLoading(false);
    }

    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const items = await listPublicExperiencesFresh();
        if (!active) return;
        const blogEntries = filterByKind(items, "blog").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const current = blogEntries.find((item) => item.id === id) ?? null;
        if (!embedded) setArticle(current);
        if (current) setRelated(selectRelated(current, blogEntries));
      } catch {
        if (active && !embedded) setError("No se pudo cargar el artículo. Intenta de nuevo en unos segundos.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const heroImage = article ? resolveHeroImage(article) : "";
  // Si el hero proviene del body (imageUrls vacío), ocultar la primera imagen del cuerpo
  // para evitar duplicidad. Si imageUrls tiene valor, el body se muestra íntegro.
  const heroIsFromBody =
    (article?.imageUrls?.filter((u) => u?.trim()).length ?? 0) === 0 && !!heroImage;
  const bodyHtml = heroIsFromBody
    ? removeFirstImageFromHtml(article?.body ?? "")
    : (article?.body ?? "");

  return (
    <>
      {/* Las meta tags (description, canonical, Open Graph) las escribe el servidor. */}
      <Head>
        <title>{article ? `${article.title} | Blog` : "Artículo | Blog"}</title>
      </Head>

      <LandingHeader />

      <main className="public-main article-page pt-[104px] md:pt-[120px]">
        {loading && (
          <p className="mx-auto w-full max-w-5xl text-text-secondary">Cargando artículo...</p>
        )}

        {error && (
          <div className="mx-auto w-full max-w-5xl">
            <ErrorAlert message={error} className="text-sm" />
          </div>
        )}

        {!loading && !error && !article && (
          <div className="mx-auto w-full max-w-5xl">
            <p className="text-text-secondary">No encontramos este artículo o no está publicado.</p>
            <Link
              href="/blog"
              className="mt-4 inline-flex items-center rounded-lg border border-slate-600 px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              Volver al blog
            </Link>
          </div>
        )}

        {!loading && !error && article && (
          <>
            <article className="article-layout mx-auto w-full max-w-6xl">
              <header className="article-hero">
                {heroImage && (
                  <Image
                    src={heroImage}
                    alt=""
                    aria-hidden="true"
                    fill
                    className={`article-hero-image${loadedHeroImage === heroImage ? " is-loaded" : ""}`}
                    sizes="(max-width: 768px) 100vw, 1152px"
                    loading="lazy"
                    onLoad={() => setLoadedHeroImage(heroImage)}
                  />
                )}
                <div className="article-hero-overlay" aria-hidden="true" />
                <div className="article-heading article-hero-content">
                  <Link href="/blog" className="article-back-link">
                    <span aria-hidden="true">←</span>
                    Todos los artículos
                  </Link>
                  <p className="article-kicker">Artículo técnico</p>
                  <h1 className="article-title">{article.title}</h1>
                  <p className="article-summary">
                    {article.summary?.trim() || "Resumen no disponible."}
                  </p>

                  <div className="article-meta" aria-label="Fechas del artículo">
                    <span>
                      Publicado <time dateTime={article.createdAt}>{formatDate(article.createdAt)}</time>
                    </span>
                    <span className="article-meta-divider" aria-hidden="true">·</span>
                    <span>
                      Actualizado <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
                    </span>
                  </div>
                </div>
              </header>

              <RichTextViewer content={bodyHtml} className="article-content" />

              {article.tags.length > 0 && (
                <footer className="article-tags" aria-label="Etiquetas del artículo">
                  {article.tags.map((tag) => (
                    <span key={`${article.id}-${tag}`} className="article-tag">
                      #{tag}
                    </span>
                  ))}
                </footer>
              )}
            </article>

            <section className="article-related">
              <div className="article-related-heading">
                <h2>Artículos relacionados</h2>
                <Link href="/blog" className="article-back-link">
                  Ver todos <span aria-hidden="true">→</span>
                </Link>
              </div>

              {related.length === 0 ? (
                <p className="text-text-secondary">No hay artículos relacionados por ahora.</p>
              ) : (
                <div className="article-related-grid">
                  {related.map((item) => (
                    <article key={item.id} className="article-related-card">
                      <h3>{item.title}</h3>
                      <p>
                        {item.summary?.trim() || stripHtml(item.body ?? "").trim() || "Artículo en actualización."}
                      </p>
                      <div className="article-related-tags">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span
                            key={`${item.id}-related-${tag}`}
                            className="article-tag"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      {/* <a>, no <Link>: la página de cada artículo la construye el servidor. */}
                      <a href={blogArticleHref(item.id)} className="article-related-link">
                        Leer artículo <span aria-hidden="true">→</span>
                      </a>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
