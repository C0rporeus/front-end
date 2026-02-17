import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

import { listPublicExperiences } from "@/api/experiences";
import LandingHeader from "@/components/layout/landing/LandingHeader";
import { Experience } from "@/interfaces/Experience";
import RichTextViewer from "@/components/UI/RichTextViewer";

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const BLOG_TAGS = ["blog", "articulo", "article", "post", "entrada"];
const PORTFOLIO_TAGS = ["portfolio", "portafolio", "proyecto", "project", "muestra", "case"];

const hasAnyTag = (item: Experience, expected: string[]) => {
  const normalizedTags = item.tags.map(normalizeText);
  return normalizedTags.some((tag) => expected.some((expectedTag) => tag === expectedTag || tag.includes(expectedTag)));
};

export default function PortfolioPage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageByExperience, setActiveImageByExperience] = useState<Record<string, number>>({});

  const updateImageIndex = (experienceId: string, nextIndex: number) => {
    setActiveImageByExperience((previous) => ({
      ...previous,
      [experienceId]: nextIndex,
    }));
  };

  useEffect(() => {
    listPublicExperiences()
      .then((data) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const portfolioItems = useMemo(() => {
    const withoutBlog = items.filter((item) => !hasAnyTag(item, BLOG_TAGS));
    const taggedAsPortfolio = withoutBlog.filter((item) => hasAnyTag(item, PORTFOLIO_TAGS));

    // Si existen items etiquetados como portafolio, se priorizan para evitar mezcla de categorias.
    const source = taggedAsPortfolio.length > 0 ? taggedAsPortfolio : withoutBlog;
    return [...source].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [items]);

  return (
    <>
      <Head>
        <title>Portafolio | Portfolio Dev</title>
      </Head>
      <LandingHeader />
      <main className="public-main pt-[96px] md:pt-[104px]">
        <section className="public-page-shell mx-auto w-full max-w-5xl">
          <h1 className="public-title">Portafolio y experiencia</h1>
          <p className="public-lead">
            Seleccion de experiencias publicadas, enfocadas en impacto tecnico y resultados.
          </p>
        </section>
        {loading && (
          <p className="mx-auto mt-6 w-full max-w-5xl text-text-secondary">Cargando experiencias...</p>
        )}
        {!loading && portfolioItems.length === 0 && (
          <p className="mx-auto mt-6 w-full max-w-5xl text-text-secondary">
            Aun no hay experiencias publicadas. Puedes agregarlas desde el panel de administracion.
          </p>
        )}
        <div className="mx-auto mt-8 grid w-full max-w-5xl gap-4 md:gap-5">
          {portfolioItems.map((item) => (
            <article id={`exp-${item.id}`} key={item.id} className="public-card">
              {item.imageUrls.length > 0 && (
                <div className="mb-4 rounded-xl border border-slate-700/70 bg-surface-900/55 p-3">
                  <div className="relative overflow-hidden rounded-lg border border-slate-700/60">
                    <img
                      src={item.imageUrls[activeImageByExperience[item.id] ?? 0]}
                      alt={`Material fotografico de ${item.title}`}
                      className="h-64 w-full object-cover md:h-80"
                    />
                  </div>
                  {item.imageUrls.length > 1 && (
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        className="rounded-md border border-slate-600 bg-surface-900/70 px-3 py-1 text-sm text-text-secondary hover:bg-surface-800/70 hover:text-text-primary"
                        onClick={() => {
                          const current = activeImageByExperience[item.id] ?? 0;
                          const previousImage = current <= 0 ? item.imageUrls.length - 1 : current - 1;
                          updateImageIndex(item.id, previousImage);
                        }}
                      >
                        Anterior
                      </button>
                      <p className="text-xs text-text-muted">
                        Imagen {(activeImageByExperience[item.id] ?? 0) + 1} de {item.imageUrls.length}
                      </p>
                      <button
                        type="button"
                        className="rounded-md border border-slate-600 bg-surface-900/70 px-3 py-1 text-sm text-text-secondary hover:bg-surface-800/70 hover:text-text-primary"
                        onClick={() => {
                          const current = activeImageByExperience[item.id] ?? 0;
                          const nextImage = current >= item.imageUrls.length - 1 ? 0 : current + 1;
                          updateImageIndex(item.id, nextImage);
                        }}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
              )}
              <h2 className="mb-2 text-xl font-semibold">{item.title}</h2>
              <p className="mb-2 text-text-secondary">{item.summary}</p>
              <RichTextViewer content={item.body} className="text-sm text-text-muted" />
              {item.tags.length > 0 && (
                <p className="mt-3 text-xs text-text-muted">Tags: {item.tags.join(", ")}</p>
              )}
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
