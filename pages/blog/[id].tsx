import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { listPublicExperiences } from "@/api/experiences";
import { API_EXPERIENCES } from "@/api/endpoints";
import LandingHeader from "@/components/layout/landing/LandingHeader";
import { Experience } from "@/interfaces/Experience";
import ErrorAlert from "@/components/UI/ErrorAlert";
import RichTextViewer from "@/components/UI/RichTextViewer";
import { stripHtml } from "@/utils/html-content";

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

export const getStaticProps: GetStaticProps<{
  article: Experience | null;
  related: Experience[];
}> = async (context) => {
  const id = typeof context.params?.id === "string" ? context.params.id : "";
  if (!id) return { props: { article: null, related: [] } };
  const items = await fetchPublicExperiencesAtBuild();
  const blogEntries = items.filter(hasBlogTag).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const article = blogEntries.find((item) => item.id === id) ?? null;
  const related = article ? selectRelated(article, blogEntries) : [];
  return { props: { article, related } };
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

const resolvePreviewImage = (item: Experience) =>
  item.imageUrls.find((url) => typeof url === "string" && url.trim().length > 0) ?? "";

type BlogDetailPageProps = {
  article: Experience | null;
  related: Experience[];
};

export default function BlogDetailPage({ article: initialArticle, related: initialRelated }: BlogDetailPageProps) {
  const router = useRouter();
  const articleId = typeof router.query.id === "string" ? router.query.id : "";

  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(!initialArticle);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialArticle && items.length === 0) return;
    listPublicExperiences()
      .then((data) => setItems(data))
      .catch(() =>
        setError("No fue posible cargar el articulo por ahora. Reintenta en unos minutos."),
      )
      .finally(() => setLoading(false));
  }, [initialArticle, items.length]);

  const blogEntries = useMemo(
    () => items.filter(hasBlogTag).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [items],
  );

  const article = useMemo(() => {
    if (initialArticle && initialArticle.id === articleId) return initialArticle;
    return blogEntries.find((item) => item.id === articleId);
  }, [initialArticle, articleId, blogEntries]);

  const related = useMemo(() => {
    if (article && initialArticle && article.id === initialArticle.id) return initialRelated;
    if (!article) return [];
    return selectRelated(article, blogEntries);
  }, [article, initialArticle, initialRelated, blogEntries]);

  return (
    <>
      <Head>
        <title>{article ? `${article.title} | Blog` : "Articulo | Blog"}</title>
      </Head>

      <LandingHeader />

      <main className="public-main pt-[96px] md:pt-[104px]">
        {loading && (
          <p className="mx-auto w-full max-w-5xl text-text-secondary">Cargando articulo...</p>
        )}

        {error && (
          <div className="mx-auto w-full max-w-5xl">
            <ErrorAlert message={error} className="text-sm" />
          </div>
        )}

        {!loading && !error && !article && (
          <div className="mx-auto w-full max-w-5xl">
            <p className="text-text-secondary">No encontramos este articulo o no esta publicado.</p>
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
            <article className="mx-auto w-full max-w-5xl">
              <div className="public-card">
                <p className="mb-3 text-xs uppercase tracking-[0.14em] text-text-muted">Articulo</p>
                <h1 className="mb-3 text-3xl font-semibold leading-tight md:text-4xl">{article.title}</h1>
                <p className="mb-4 text-text-secondary">
                  {article.summary?.trim() || "Resumen no disponible."}
                </p>

                <div className="mb-6 flex flex-wrap gap-2 text-xs text-text-muted">
                  <span className="rounded-md border border-slate-700/70 bg-surface-900/70 px-2 py-1">
                    Publicado: {formatDate(article.createdAt)}
                  </span>
                  <span className="rounded-md border border-slate-700/70 bg-surface-900/70 px-2 py-1">
                    Actualizado: {formatDate(article.updatedAt)}
                  </span>
                </div>

                {resolvePreviewImage(article) && (
                  <div className="relative mb-6 h-56 overflow-hidden rounded-xl border border-slate-700/70 md:h-80">
                    <Image
                      src={resolvePreviewImage(article)}
                      alt={`Imagen principal de ${article.title}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 960px"
                    />
                  </div>
                )}

                <RichTextViewer content={article.body} className="mb-6 text-text-secondary" />

                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={`${article.id}-${tag}`}
                        className="rounded-full border border-slate-600/80 bg-surface-900/70 px-3 py-1 text-xs text-text-secondary"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>

            <section className="mx-auto mt-8 w-full max-w-5xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">Articulos relacionados</h2>
                <Link
                  href="/blog"
                  className="text-sm text-sky-200 hover:text-sky-100"
                >
                  Ver todos
                </Link>
              </div>

              {related.length === 0 ? (
                <p className="text-text-secondary">No hay articulos relacionados por ahora.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {related.map((item) => (
                    <article key={item.id} className="public-card">
                      <h3 className="mb-2 text-lg font-semibold leading-tight">{item.title}</h3>
                      <p className="mb-3 text-sm text-text-secondary">
                        {item.summary?.trim() || stripHtml(item.body ?? "").trim() || "Articulo en actualizacion."}
                      </p>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span
                            key={`${item.id}-related-${tag}`}
                            className="rounded-full border border-slate-600/80 bg-surface-900/70 px-3 py-1 text-xs text-text-secondary"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={`/blog/${item.id}`}
                        className="inline-flex items-center rounded-lg border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:border-sky-300/70 hover:bg-sky-500/20"
                      >
                        Leer articulo
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
