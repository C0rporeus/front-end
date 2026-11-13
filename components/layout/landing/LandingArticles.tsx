import Link from "next/link";

import BoardSection from "@/components/board/BoardSection";
import FadeImage from "@/components/UI/FadeImage";

export type ArticleEntry = {
  id: string;
  title: string;
  description: string;
  image: string;
  thumb?: string;
  /** Enlace generado con blogArticleHref(); se navega con <a>, nunca con <Link>. */
  url: string;
  createdAt: string;
};

type LandingArticlesProps = {
  articles: ArticleEntry[];
  isLoading?: boolean;
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", year: "numeric" })
    .format(parsed)
    .replace(/\./g, "");
};

/** Artículos como registro: el más reciente abierto y el resto en filas con fecha. */
const LandingArticles = ({ articles, isLoading = false }: LandingArticlesProps) => {
  const [latest, ...rest] = articles;
  const showSkeleton = isLoading && articles.length === 0;

  return (
    <BoardSection
      headingId="seccion-blog"
      title="Artículos recientes"
      lead="Notas técnicas sobre lo que construyo y opero: decisiones, consecuencias y lo que cambiaría."
      action={
        <Link href="/blog" className="route-link">
          Todos los artículos
        </Link>
      }
    >
      {showSkeleton && (
        <div className="article-log" aria-busy="true">
          <div className="article-lead article-skeleton" aria-hidden="true" />
          <div className="article-rows article-skeleton" aria-hidden="true" />
        </div>
      )}
      {!showSkeleton && articles.length === 0 && (
        <p className="board-empty">Todavía no hay artículos publicados.</p>
      )}
      {latest && (
        <div className="article-log">
          <article className="article-lead">
            <a href={latest.url} className="article-lead-media" tabIndex={-1} aria-hidden="true">
              {latest.image ? (
                <FadeImage
                  src={latest.thumb || latest.image}
                  srcSet={latest.thumb ? `${latest.thumb} 640w, ${latest.image} 1200w` : undefined}
                  sizes={latest.thumb ? "(min-width: 1024px) 560px, 92vw" : undefined}
                  alt=""
                  wrapperClassName="article-lead-image"
                  priority
                />
              ) : (
                <span className="article-lead-image article-lead-image-empty" />
              )}
            </a>
            <div className="article-lead-copy">
              <p className="article-lead-meta">
                <span className="lamp" data-state="active" aria-hidden="true" />
                <span>Más reciente</span>
                <time className="data-text" dateTime={latest.createdAt}>
                  {formatDate(latest.createdAt)}
                </time>
              </p>
              <h3 className="article-lead-title">
                <a href={latest.url}>{latest.title}</a>
              </h3>
              <p className="article-lead-summary">{latest.description}</p>
              <a href={latest.url} className="route-link" aria-label={`Leer artículo: ${latest.title}`}>
                Leer artículo
              </a>
            </div>
          </article>

          {rest.length > 0 && (
            <ol className="article-rows">
              {rest.map((article) => (
                <li key={article.id}>
                  <a href={article.url} className="article-row">
                    <span className="lamp" aria-hidden="true" />
                    <time className="data-text" dateTime={article.createdAt}>
                      {formatDate(article.createdAt)}
                    </time>
                    <span className="article-row-title">{article.title}</span>
                    <span className="article-row-arrow" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </BoardSection>
  );
};

export default LandingArticles;
