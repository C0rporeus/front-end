import { stripHtml } from "@/utils/html-content";

/** Dominio canónico: el apex no está conectado en Firebase Hosting (responde 404). */
export const SITE_URL = "https://www.yonathangutierrez.dev";
export const SITE_NAME = "Yonathan Gutierrez";

/** Dimensiones de la variante ?variant=og que genera la API (recorte 1.91:1, JPEG). */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100").replace(/\/$/, "");

// Objetos subidos por la API: <bucket>/portfolio-images/<uuid>.<ext>
const GCS_UPLOAD_PATTERN =
  /^https:\/\/storage\.googleapis\.com\/[^/]+\/portfolio-images\/([0-9a-f-]{36}\.(?:jpe?g|png|gif|webp))(?:[?#].*)?$/i;

/**
 * URL estable para og:image. Las imágenes del bucket privado solo existen como URLs
 * firmadas que expiran; los crawlers de Open Graph necesitan una URL permanente,
 * así que se sirven vía GET /api/media/:name. Otras URLs http(s) pasan tal cual.
 */
export function toShareableImageURL(url: string): string {
  const trimmed = url.trim();
  const match = GCS_UPLOAD_PATTERN.exec(trimmed);
  if (match) return `${API_URL}/api/media/${match[1].toLowerCase()}?variant=og`;
  return /^https?:\/\//i.test(trimmed) ? trimmed : "";
}

// En build (Node) stripHtml no decodifica entidades; se cubren las habituales del editor.
const decodeBasicEntities = (text: string) =>
  text
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/** true si la URL es la variante generada por la API (dimensiones conocidas). */
export const isGeneratedOGImage = (url: string) => url.includes("/api/media/") && url.endsWith("?variant=og");

/** Descripción para meta tags: resumen o texto del cuerpo, recortado a ~160 caracteres. */
export function buildMetaDescription(summary: string, bodyHtml: string, maxLength = 160): string {
  const text = decodeBasicEntities(summary?.trim() || stripHtml(bodyHtml ?? ""))
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
