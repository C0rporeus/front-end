import { useState } from "react";

import FadeImage from "@/components/UI/FadeImage";
import { visibleTags } from "@/utils/content-kind";
import { extractFirstImageFromHtml, stripHtml } from "@/utils/html-content";

export type CapabilityItem = {
  id: string;
  title: string;
  summary: string;
  body: string;
  imageUrls: string[];
  /** Miniatura de la primera imagen: la marca mide 48 px y no necesita el original. */
  thumbUrl?: string;
  tags: string[];
};

// Conectores que no deben dar iniciales ("Gobierno y seguridad" → "GS", no "GY").
const CONNECTOR_WORDS = new Set([
  "y", "e", "o", "u", "a", "al", "de", "del", "la", "las", "el", "los", "en", "para", "por", "con", "como",
  "and", "or", "of", "the", "for", "in", "to",
]);

/** Dos iniciales del título, ignorando conectores y signos (p. ej. paréntesis). */
export const initials = (title: string) =>
  title
    .split(/\s+/)
    .map((word) => word.replace(/^[^\p{L}\p{N}]+/u, ""))
    .filter((word) => word && !CONNECTOR_WORDS.has(word.toLowerCase()))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

function CapabilityMark({ title, image, thumb }: { title: string; image: string; thumb?: string }) {
  // Orden de intento: miniatura, original e iniciales (las imágenes antiguas no tienen miniatura).
  const sources = [thumb, image].filter((source): source is string => Boolean(source));
  const [attempt, setAttempt] = useState(0);
  const src = sources[attempt];
  if (!src) {
    return (
      <span className="capability-mark" aria-hidden="true">
        {initials(title)}
      </span>
    );
  }
  return (
    <FadeImage
      src={src}
      alt=""
      wrapperClassName="capability-mark capability-mark-image"
      onError={() => setAttempt((current) => current + 1)}
    />
  );
}

/** Contenido de una capacidad: marca (imagen o iniciales), título, descripción y tags. Sin enlace. */
export function CapabilityTileContent({ item }: { item: CapabilityItem }) {
  const description = item.summary?.trim() || stripHtml(item.body ?? "").trim();
  const image = item.imageUrls?.[0] || extractFirstImageFromHtml(item.body ?? "") || "";
  const tags = visibleTags(item).slice(0, 5);
  return (
    <div className="capability-link">
      <CapabilityMark title={item.title} image={image} thumb={item.thumbUrl} />
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
    </div>
  );
}
