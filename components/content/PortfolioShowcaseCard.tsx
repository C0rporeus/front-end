import { useState } from "react";

import RichTextViewer from "@/components/UI/RichTextViewer";
import type { Experience } from "@/interfaces/Experience";
import { visibleTags } from "@/utils/content-kind";

const navButtonClass =
  "rounded-md border border-slate-600 bg-surface-900/70 px-3 py-1 text-sm text-text-secondary hover:bg-surface-800/70 hover:text-text-primary";

/** Muestra de portafolio: la imagen es protagonista, el texto explica el resultado. */
const PortfolioShowcaseCard = ({ item }: { item: Experience }) => {
  const [activeImage, setActiveImage] = useState(0);
  const total = item.imageUrls.length;
  const tags = visibleTags(item);

  return (
    <article id={`exp-${item.id}`} className="public-card">
      {total > 0 && (
        <div className="mb-4 rounded-xl border border-slate-700/70 bg-surface-900/55 p-3">
          <div className="relative overflow-hidden rounded-lg border border-slate-700/60">
            {/* eslint-disable-next-line @next/next/no-img-element -- URLs firmadas externas */}
            <img
              src={item.imageUrls[activeImage]}
              alt={`Material fotográfico de ${item.title}`}
              className="h-64 w-full object-cover md:h-80"
            />
          </div>
          {total > 1 && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                className={navButtonClass}
                onClick={() => setActiveImage((current) => (current <= 0 ? total - 1 : current - 1))}
              >
                Anterior
              </button>
              <p className="text-xs text-text-muted">
                Imagen {activeImage + 1} de {total}
              </p>
              <button
                type="button"
                className={navButtonClass}
                onClick={() => setActiveImage((current) => (current >= total - 1 ? 0 : current + 1))}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
      <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
      {item.summary && <p className="mb-2 text-text-secondary">{item.summary}</p>}
      <RichTextViewer content={item.body} className="text-sm text-text-muted" />
      {tags.length > 0 && (
        <ul className="capability-tags mt-3" aria-label="Stack utilizado">
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
    </article>
  );
};

export default PortfolioShowcaseCard;
