import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { GetStaticPaths, GetStaticProps } from "next";
import { useEffect, useState } from "react";

import { API_EXPERIENCES } from "@/api/endpoints";
import { listPublicExperiencesFresh } from "@/api/experiences";

import LandingHeader from "@/components/layout/landing/LandingHeader";
import { Experience } from "@/interfaces/Experience";
import ErrorAlert from "@/components/UI/ErrorAlert";
import RichTextViewer from "@/components/UI/RichTextViewer";
import { stripHtml, extractFirstImageFromHtml, removeFirstImageFromHtml } from "@/utils/html-content";
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_NAME,
  SITE_URL,
  buildMetaDescription,
  isGeneratedOGImage,
  toShareableImageURL,
} from "@/utils/seo";

const BLOG_TAGS = ["blog", "articulo", "article", "post", "entrada"];

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const hasBlogTag = (item: Experience) => {
  const normalizedTags = item.tags.map(normalizeText);
  return normalizedTags.some((tag) => BLOG_TAGS.some((blogTag) => tag === blogTag || tag.includes(blogTag)));
};

const fetchPublicExperiencesAtBuild = async (): Promise<Experience[]> => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";
  const url = `${base.replace(/\/$/, "")}${API_EXPERIENCES}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as { items?: Experience[] };
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map((item) => ({
    ...item,
    imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [],
  }));
};

export const getStaticPaths: GetStaticPaths = async () => {
  const items = await fetchPublicExperiencesAtBuild();
  const blogIds = items.filter(hasBlogTag).map((item) => item.id);
  const paths = blogIds.map((id) => ({ params: { id } }));
  return { paths, fallback: false };
};

function selectRelated(article: Experience, blogEntries: Experience[]): Experience[] {
  const currentTags = new Set(article.tags.map(normalizeText));
  const withScore = blogEntries
    .filter((item) => item.id !== article.id)
    .map((item) => {
      const sharedTags = item.tags.map(normalizeText).filter((tag) => currentTags.has(tag)).length;
      return { item, score: sharedTags * 2 };
    });
  const ranked = withScore
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.item.createdAt.localeCompare(a.item.createdAt))
    .map((entry) => entry.item)
    .slice(0, 4);
  if (ranked.length > 0) return ranked;
  return blogEntries.filter((item) => item.id !== article.id).slice(0, 4);
}

export const getStaticProps: GetStaticProps<BlogDetailPageProps> = async (context) => {
  const id = typeof context.params?.id === "string" ? context.params.id : "";
  if (!id) return { props: { article: null, related: [], ogImage: "" } };
  const items = await fetchPublicExperiencesAtBuild();
  const blogEntries = items.filter(hasBlogTag).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const article = blogEntries.find((item) => item.id === id) ?? null;
  const related = article ? selectRelated(article, blogEntries) : [];
  // Do not bake expiring GCS signatures into static HTML/JSON. The browser
  // fetches fresh signed URLs after hydration; text remains available offline.
  const withoutSignedImages = (item: Experience): Experience => ({
    ...item,
    imageUrls: item.imageUrls.filter((url) => !url.includes("storage.googleapis.com")),
    body: (item.body ?? "").replace(
      /<img\b(?=[^>]*\bsrc=["']https?:\/\/storage\.googleapis\.com\/)[^>]*>/gi,
      "",
    ),
  });
  // og:image se calcula antes de quitar las firmas: los crawlers no ejecutan JS,
  // así que necesitan una URL permanente ya escrita en el HTML estático.
  const ogImage = article ? toShareableImageURL(resolveHeroImage(article)) : "";
  return {
    props: {
      article: article ? withoutSignedImages(article) : null,
      related: related.map(withoutSignedImages),
      ogImage,
    },
  };
};

type BlogDetailPageProps = {
  article: Experience | null;
  related: Experience[];
  ogImage: string;
};

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


export default function BlogDetailPage({
  article: initialArticle,
  related: initialRelated,
  ogImage,
}: BlogDetailPageProps) {

  const [liveArticle, setLiveArticle] = useState<Experience | null>(null);
  const [liveRelated, setLiveRelated] = useState<Experience[]>([]);
  const [loadedHeroImage, setLoadedHeroImage] = useState("");

  const [loading, setLoading] = useState(!initialArticle);
  const [error, setError] = useState("");

  // En static export con fallback:false, initialArticle siempre es la fuente de verdad.
  // loading:false inmediato cuando llegan los props estáticos.
  useEffect(() => {
    setLoading(!initialArticle);
  }, [initialArticle]);

  useEffect(() => {
    let active = true;
    const refreshImages = async () => {
      if (!initialArticle) return;
      try {
        const items = await listPublicExperiencesFresh();
        if (!active) return;
        const blogEntries = items.filter(hasBlogTag).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const current = blogEntries.find((item) => item.id === initialArticle.id);
        if (current) {
          setLiveArticle(current);
          setLiveRelated(selectRelated(current, blogEntries));
        }
      } catch {
        // Conservamos el contenido estático si la API no está disponible.
      }
    };
    void refreshImages();
    return () => { active = false; };
  }, [initialArticle]);

  // Usar initialArticle directamente — elimina la race condition con router.query
  const article = liveArticle ?? initialArticle ?? null;
  const related = liveArticle ? liveRelated : (initialArticle ? initialRelated : []);

  const heroImage = article ? resolveHeroImage(article) : "";
  // Meta tags solo desde los props estáticos: es lo que leen los crawlers sin JS.
  const canonicalUrl = initialArticle ? `${SITE_URL}/blog/${initialArticle.id}/` : SITE_URL;
  const metaDescription = initialArticle
    ? buildMetaDescription(initialArticle.summary, initialArticle.body)
    : "";

  // Si el hero proviene del body (imageUrls vacío), ocultar la primera imagen del cuerpo
  // para evitar duplicidad. Si imageUrls tiene valor, el body se muestra íntegro.
  const heroIsFromBody =
    (article?.imageUrls?.filter((u) => u?.trim()).length ?? 0) === 0 && !!heroImage;
  const bodyHtml = heroIsFromBody
    ? removeFirstImageFromHtml(article?.body ?? "")
    : (article?.body ?? "");

  return (
    <>
      <Head>
        <title>{article ? `${article.title} | Blog` : "Artículo | Blog"}</title>
        {initialArticle && (
          <>
            <meta name="description" content={metaDescription} key="description" />
            <link rel="canonical" href={canonicalUrl} key="canonical" />
            <meta property="og:type" content="article" key="og:type" />
            <meta property="og:site_name" content={SITE_NAME} key="og:site_name" />
            <meta property="og:locale" content="es_LA" key="og:locale" />
            <meta property="og:title" content={initialArticle.title} key="og:title" />
            <meta property="og:description" content={metaDescription} key="og:description" />
            <meta property="og:url" content={canonicalUrl} key="og:url" />
            <meta property="article:published_time" content={initialArticle.createdAt} key="article:published_time" />
            <meta property="article:modified_time" content={initialArticle.updatedAt} key="article:modified_time" />
            <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} key="twitter:card" />
            <meta name="twitter:title" content={initialArticle.title} key="twitter:title" />
            <meta name="twitter:description" content={metaDescription} key="twitter:description" />
            {ogImage && (
              <>
                <meta property="og:image" content={ogImage} key="og:image" />
                <meta property="og:image:alt" content={initialArticle.title} key="og:image:alt" />
                {isGeneratedOGImage(ogImage) && (
                  <>
                    <meta property="og:image:type" content="image/jpeg" key="og:image:type" />
                    <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} key="og:image:width" />
                    <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} key="og:image:height" />
                  </>
                )}
                <meta name="twitter:image" content={ogImage} key="twitter:image" />
              </>
            )}
          </>
        )}
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
                      <Link
                        href={`/blog/${item.id}`}
                        className="article-related-link"
                      >
                        Leer artículo <span aria-hidden="true">→</span>
                      </Link>
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
