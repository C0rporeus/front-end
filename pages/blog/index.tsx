import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LandingHeader from "@/components/layout/landing/LandingHeader";
import { listPublicExperiences } from "@/api/experiences";
import { Experience } from "@/interfaces/Experience";
import ErrorAlert from "@/components/UI/ErrorAlert";

const BLOG_TAGS = ["blog", "articulo", "article", "post", "entrada"];
const BLOG_KEYWORDS = ["blog", "articulo", "article", "post", "entrada", "editorial"];

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const hasBlogTag = (item: Experience) => {
  const normalizedTags = item.tags.map(normalizeText);
  return normalizedTags.some((tag) => BLOG_TAGS.some((blogTag) => tag === blogTag || tag.includes(blogTag)));
};

const matchesBlogKeyword = (item: Experience) => {
  const haystack = normalizeText([item.title, item.summary, item.body, item.tags.join(" ")].join(" "));
  return BLOG_KEYWORDS.some((keyword) => haystack.includes(keyword));
};

const resolvePreviewImage = (item: Experience) =>
  item.imageUrls.find((url) => typeof url === "string" && url.trim().length > 0) ?? "";

const formatCreatedAt = (value: string) => {
  if (!value) return "Fecha no disponible";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

export default function BlogPage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listPublicExperiences()
      .then((data) => setItems(data))
      .catch(() =>
        setError("No fue posible cargar los articulos del CMS por ahora. Reintenta en unos minutos."),
      )
      .finally(() => setLoading(false));
  }, []);

  const posts = useMemo(() => {
    const taggedItems = items.filter(hasBlogTag);
    const source = taggedItems.length > 0 ? taggedItems : items.filter(matchesBlogKeyword);
    return [...source].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items]);

  return (
    <>
      <Head>
        <title>Blog | Portfolio Dev</title>
      </Head>
      <LandingHeader />
      <main className="public-main pt-[96px] md:pt-[104px]">
        <section className="public-page-shell mx-auto w-full max-w-5xl">
          <h1 className="public-title">Blog tecnico</h1>
          <p className="public-lead">
            Articulos con aprendizajes practicos en arquitectura, calidad de codigo y
            seguridad aplicada a productos digitales.
          </p>
        </section>

        {error && (
          <div className="mx-auto mt-6 w-full max-w-5xl">
            <ErrorAlert message={error} className="text-sm" />
          </div>
        )}

        {loading && (
          <p className="mx-auto mt-6 w-full max-w-5xl text-text-secondary">Cargando articulos...</p>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="mx-auto mt-6 w-full max-w-5xl text-text-secondary">
            Aun no hay articulos publicados. Puedes agregarlos desde el panel de administracion.
          </p>
        )}

        {posts.length > 0 && (
          <div className="mx-auto mt-8 grid w-full max-w-5xl gap-4 md:gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="public-card overflow-hidden p-0"
              >
                <div className="grid gap-0 md:grid-cols-[260px_1fr]">
                  {resolvePreviewImage(post) ? (
                    <div className="relative min-h-[180px] border-b border-slate-700/70 md:min-h-[100%] md:border-b-0 md:border-r">
                      <Image
                        src={resolvePreviewImage(post)}
                        alt={`Vista previa de ${post.title}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 260px"
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-[180px] items-center justify-center border-b border-slate-700/70 bg-surface-900/60 px-4 text-xs uppercase tracking-[0.16em] text-text-muted md:min-h-[100%] md:border-b-0 md:border-r">
                      Sin vista previa
                    </div>
                  )}

                  <div className="p-5 md:p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      <span className="rounded-md border border-slate-700/70 bg-surface-900/70 px-2 py-1">
                        Publicado: {formatCreatedAt(post.createdAt)}
                      </span>
                      <span className="rounded-md border border-slate-700/70 bg-surface-900/70 px-2 py-1">
                        Actualizado: {formatCreatedAt(post.updatedAt)}
                      </span>
                    </div>

                    <h2 className="mb-2 text-xl font-semibold leading-tight md:text-2xl">{post.title}</h2>
                    <p className="mb-4 text-text-secondary">
                      {post.summary?.trim() || post.body?.trim() || "Articulo en actualizacion."}
                    </p>

                    {post.tags.length > 0 && (
                      <div className="mb-5 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={`${post.id}-${tag}`}
                            className="rounded-full border border-slate-600/80 bg-surface-900/70 px-3 py-1 text-xs text-text-secondary"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link
                      href={`/blog/${post.id}`}
                      className="inline-flex items-center rounded-lg border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:border-sky-300/70 hover:bg-sky-500/20"
                    >
                      Leer articulo
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
