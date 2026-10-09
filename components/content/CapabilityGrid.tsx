import { useState } from "react";

import { visibleTags } from "@/utils/content-kind";
import { extractFirstImageFromHtml, stripHtml } from "@/utils/html-content";

export type CapabilityItem = {
  id: string;
  title: string;
  summary: string;
  body: string;
  imageUrls: string[];
  tags: string[];
};

type CapabilityGridProps = {
  items: CapabilityItem[];
  /** Si se define, cada tile enlaza a `${linkPrefix}${id}`; si no, el tile es un ancla `skill-${id}`. */
  linkPrefix?: string;
  emptyMessage?: string;
};

const initials = (title: string) =>
  title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

function CapabilityMark({ title, image }: { title: string; image: string }) {
  const [failed, setFailed] = useState(false);
  if (!image || failed) {
    return (
      <span className="capability-mark" aria-hidden="true">
        {initials(title)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- URLs firmadas externas, sin optimización
    <img className="capability-mark" src={image} alt="" loading="lazy" onError={() => setFailed(true)} />
  );
}

const CapabilityGrid = ({ items, linkPrefix, emptyMessage }: CapabilityGridProps) => {
  if (items.length === 0) {
    return emptyMessage ? <p className="slider-empty-state">{emptyMessage}</p> : null;
  }

  return (
    <ul className="capability-grid">
      {items.map((item) => {
        const description = item.summary?.trim() || stripHtml(item.body ?? "").trim();
        const image = item.imageUrls?.[0] || extractFirstImageFromHtml(item.body ?? "") || "";
        const tags = visibleTags(item).slice(0, 5);
        const content = (
          <>
            <CapabilityMark title={item.title} image={image} />
            <div className="capability-copy">
              <h3 className="capability-title">{item.title}</h3>
              {description && <p className="capability-description">{description}</p>}
              {tags.length > 0 && (
                <ul className="capability-tags" aria-label="Stack y áreas">
                  {tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              )}
            </div>
          </>
        );

        return (
          <li key={item.id} id={linkPrefix ? undefined : `skill-${item.id}`} className="capability-tile">
            {linkPrefix ? (
              <a href={`${linkPrefix}${item.id}`} className="capability-link">
                {content}
              </a>
            ) : (
              <div className="capability-link">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default CapabilityGrid;
