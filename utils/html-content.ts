import DOMPurify from "dompurify";

const HTML_TAG_REGEX = /<[a-z][\s\S]*>/i;

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s",
  "h1", "h2", "h3", "h4",
  "ul", "ol", "li",
  "blockquote", "img", "a",
  "code", "pre",
];

const ALLOWED_ATTR = ["href", "src", "alt", "target", "rel", "class", "style"];

export function isHtmlContent(value: string): boolean {
  return HTML_TAG_REGEX.test(value);
}

export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") return dirty;
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/** Sanitize SVG content from diagram generators (mermaid, etc.) */
export function sanitizeSvg(svgString: string): string {
  if (typeof window === "undefined") return svgString;
  return DOMPurify.sanitize(svgString, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ["foreignObject"],
    ALLOW_DATA_ATTR: false,
  });
}

export function stripHtml(html: string): string {
  if (!html) return "";
  if (!isHtmlContent(html)) return html;
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent ?? "";
  }
  return html.replace(/<[^>]*>/g, "").trim();
}

/** Extrae el src de la primera imagen embebida en HTML (cubre src='...' y src="...") */
export function extractFirstImageFromHtml(html: string): string {
  if (!html) return "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? "";
}

/** Cuenta todas las etiquetas <img> en un bloque de HTML */
export function countImagesInHtml(html: string): number {
  if (!html) return 0;
  const matches = html.match(/<img[^>]+>/gi);
  return matches?.length ?? 0;
}

/**
 * Elimina la primera <img> del HTML y limpia el contenedor padre si queda vacío.
 * Usado para evitar duplicar la imagen de hero que ya se muestra en el encabezado del artículo.
 */
export function removeFirstImageFromHtml(html: string): string {
  if (!html) return html;
  const withoutImg = html.replace(/<img[^>]*\/?>/i, "");
  return withoutImg
    .replace(/<p>(\s|&nbsp;)*<\/p>/gi, "")
    .replace(/<figure>(\s|&nbsp;)*<\/figure>/gi, "");
}
