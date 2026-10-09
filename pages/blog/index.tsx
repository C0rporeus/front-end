import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import LandingHeader from "@/components/layout/landing/LandingHeader";
import { listPublicExperiences } from "@/api/experiences";
import { Experience } from "@/interfaces/Experience";
import ErrorAlert from "@/components/UI/ErrorAlert";
import { extractFirstImageFromHtml, stripHtml } from "@/utils/html-content";

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

const resolvePreviewImage = (item: Experience): string =>
  item.imageUrls.find((url) => typeof url === "string" && url.trim().length > 0) ??
  extractFirstImageFromHtml(item.body ?? "") ??
  "";

function BlogPreviewImage({ src, alt }: { src: string; alt: string }) {
  const [loadedSrc, setLoadedSrc] = useState("");

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`blog-preview-image${loadedSrc === src ? " is-loaded" : ""}`}
      sizes="(max-width: 767px) 100vw, 260px"
      loading="lazy"
      onLoad={() => setLoadedSrc(src)}
    />
  );
}

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
  const [viewportCardMinHeight, setViewportCardMinHeight] = useState(0);
  const blogListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listPublicExperiences()
      .then((data) => setItems(data))
      .catch(() =>
        setError("No fue posible cargar los artículos del CMS. Inténtalo de nuevo en unos minutos."),
      )
      .finally(() => setLoading(false));
  }, []);

  const posts = useMemo(() => {
    const taggedItems = items.filter(hasBlogTag);
    const source = taggedItems.length > 0 ? taggedItems : items.filter(matchesBlogKeyword);
    return [...source].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items]);

  useEffect(() => {
    const list = blogListRef.current;
    const firstCard = list?.querySelector<HTMLElement>(".blog-post-card");
    if (loading || !list || !firstCard) return;

    let frame = 0;
    const measureAvailableHeight = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const cardTopInPage = firstCard.getBoundingClientRect().top + window.scrollY;
        const rowGap = Number.parseFloat(window.getComputedStyle(list).rowGap) || 0;
        const viewportBottomClearance = 24;
        const availableHeight =
          window.innerHeight - cardTopInPage - rowGap - viewportBottomClearance;
        const nextHeight = Math.max(0, Math.floor(availableHeight / 2));

        setViewportCardMinHeight((currentHeight) =>
          currentHeight === nextHeight ? currentHeight : nextHeight,
        );
      });
    };

    measureAvailableHeight();
    window.addEventListener("resize", measureAvailableHeight);

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measureAvailableHeight);
    const intro = list.parentElement?.querySelector<HTMLElement>(".public-page-shell");
    const header = document.querySelector<HTMLElement>("header");
    if (intro) resizeObserver?.observe(intro);
    if (header) resizeObserver?.observe(header);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measureAvailableHeight);
      resizeObserver?.disconnect();
    };
  }, [loading, posts.length]);

  return (
    <>
      <Head>
        <title>Artículos | Yonathan Gutierrez</title>
        <meta
          name="description"
          content="Notas técnicas sobre infraestructura, seguridad informática, sistemas distribuidos y operación de software."
        />
      </Head>
      <LandingHeader />
      <main className="public-main pt-[96px] md:pt-[104px]">
        <section className="public-page-shell mx-auto w-full max-w-5xl p-5 md:p-6">
          <h1 className="public-title">Blog técnico</h1>
          <p className="public-lead">
            Artículos con aprendizajes prácticos en arquitectura, calidad de código y
            seguridad aplicada a productos digitales.
          </p>
        </section>

        {error && (
          <div className="mx-auto mt-6 w-full max-w-5xl">
            <ErrorAlert message={error} className="text-sm" />
          </div>
        )}

        {loading && (
          <p className="mx-auto mt-6 w-full max-w-5xl text-text-secondary">Cargando artículos...</p>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="mx-auto mt-6 w-full max-w-5xl text-text-secondary">
            Aún no hay artículos publicados. Puedes agregarlos desde el panel de administración.
          </p>
        )}

        {posts.length > 0 && (
          <div
            ref={blogListRef}
            className="blog-post-list mx-auto mt-6 grid w-full max-w-5xl gap-4 md:gap-5"
            style={{ "--blog-card-viewport-min-height": `${viewportCardMinHeight}px` } as CSSProperties}
          >
            {posts.map((post) => (
              <article
                key={post.id}
                className="blog-post-card public-card overflow-hidden p-0"
              >
                <div className="grid min-w-0 gap-0 md:grid-cols-[260px_minmax(0,1fr)]">
                  {resolvePreviewImage(post) ? (
                    <div className="blog-preview-frame relative aspect-video border-b border-slate-700/70 md:aspect-auto md:border-b-0 md:border-r">
                      <BlogPreviewImage
                        src={resolvePreviewImage(post)}
                        alt={`Vista previa de ${post.title}`}
                      />
                    </div>
                  ) : (
                    <div className="blog-preview-frame blog-preview-empty flex aspect-video items-center justify-center border-b border-slate-700/70 bg-surface-900/60 px-4 text-xs uppercase tracking-[0.16em] text-text-muted md:aspect-auto md:border-b-0 md:border-r">
                      Sin vista previa
                    </div>
                  )}

                  <div className="blog-card-content p-4 md:p-5">
                    <div className="blog-card-meta flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      <span className="rounded-md border border-slate-700/70 bg-surface-900/70 px-2 py-1">
                        Publicado: {formatCreatedAt(post.createdAt)}
                      </span>
                      <span className="rounded-md border border-slate-700/70 bg-surface-900/70 px-2 py-1">
                        Actualizado: {formatCreatedAt(post.updatedAt)}
                      </span>
                    </div>

                    <h2 className="blog-card-title">{post.title}</h2>
                    <p className="blog-card-summary">
                      {post.summary?.trim() || stripHtml(post.body ?? "").trim() || "Artículo en actualización."}
                    </p>

                    {post.tags.length > 0 && (
                      <div className="blog-card-tags flex flex-wrap">
                        {post.tags.map((tag) => (
                          <span
                            key={`${post.id}-${tag}`}
                            className="blog-card-tag rounded-full border border-slate-600/80 bg-surface-900/70 text-text-secondary"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link
                      href={`/blog/${post.id}`}
                      className="blog-card-link mt-auto inline-flex w-fit items-center self-start rounded-lg border border-sky-400/40 bg-sky-500/10 text-sm font-medium text-sky-200 transition hover:border-sky-300/70 hover:bg-sky-500/20"
                    >
                      Leer artículo
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
