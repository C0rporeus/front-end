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
