/**
 * Clasificación única del contenido del CMS. Artículos, capacidades, muestras y
 * experiencias comparten el mismo modelo en backend y se distinguen por tags;
 * cada sección pública debe filtrar con esta función para no mezclarlos.
 */

export type ContentKind = "blog" | "skill" | "portfolio" | "experience";

type Taggable = { tags: string[] };

// Orden = precedencia: un ítem con "blog" y "skill" se trata como artículo.
const KIND_TAGS: [Exclude<ContentKind, "experience">, string[]][] = [
  ["blog", ["blog", "articulo", "article", "post", "entrada"]],
  ["skill", ["skill", "skills", "habilidad", "capacidad"]],
  ["portfolio", ["portfolio", "portafolio", "muestra"]],
];

export const CONTENT_KIND_LABELS: Record<ContentKind, string> = {
  blog: "Artículo",
  skill: "Capacidad",
  portfolio: "Muestra",
  experience: "Experiencia",
};

const normalizeTag = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();

export function resolveContentKind(item: Taggable): ContentKind {
  const tags = item.tags.map(normalizeTag);
  const match = KIND_TAGS.find(([, kindTags]) => tags.some((tag) => kindTags.includes(tag)));
  return match ? match[0] : "experience";
}

export function filterByKind<T extends Taggable>(items: T[], ...kinds: ContentKind[]): T[] {
  return items.filter((item) => kinds.includes(resolveContentKind(item)));
}

/** Tags que solo existen para clasificar y no aportan al lector. */
export function visibleTags(item: Taggable): string[] {
  const internal = new Set(KIND_TAGS.flatMap(([, kindTags]) => kindTags));
  return item.tags.filter((tag) => !internal.has(normalizeTag(tag)));
}
