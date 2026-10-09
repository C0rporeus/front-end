/**
 * Prebuild script: genera public/sitemap.xml consultando la API pública.
 * Se ejecuta antes de `next build` vía el script "build" en package.json.
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = "https://www.yonathangutierrez.dev";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.yonathangutierrez.dev";
const TODAY = new Date().toISOString().split("T")[0];

const BLOG_TAGS = ["blog", "articulo", "article", "post", "entrada"];

const TOOL_SLUGS = [
  "base64",
  "uuid",
  "certs",
  "rsa-keys",
  "jwt-decoder",
  "domain-validator",
  "dns-propagation",
  "mail-records",
  "blacklist",
  "cidr",
  "excalidraw",
  "mermaid",
  "sql-visualizer",
];

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasBlogTag(item) {
  const normalizedTags = (item.tags ?? []).map(normalizeText);
  return normalizedTags.some((tag) =>
    BLOG_TAGS.some((blogTag) => tag === blogTag || tag.includes(blogTag)),
  );
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc, { lastmod = TODAY, priority = "0.7", changefreq = "monthly" } = {}) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function fetchBlogArticles() {
  try {
    const res = await fetch(`${API_URL}/api/experiences`);
    if (!res.ok) {
      console.warn(`[sitemap] API respondió ${res.status} — solo se incluirán rutas estáticas.`);
      return [];
    }
    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    return items.filter(hasBlogTag);
  } catch (err) {
    console.warn(`[sitemap] No se pudo conectar con la API: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log("[sitemap] Generando sitemap.xml...");

  const articles = await fetchBlogArticles();
  console.log(`[sitemap] Artículos de blog encontrados: ${articles.length}`);

  const staticPages = [
    urlEntry(`${BASE_URL}/`, { priority: "1.0", changefreq: "weekly" }),
    urlEntry(`${BASE_URL}/about/`, { priority: "0.8", changefreq: "monthly" }),
    urlEntry(`${BASE_URL}/blog/`, { priority: "0.9", changefreq: "weekly" }),
    urlEntry(`${BASE_URL}/portfolio/`, { priority: "0.9", changefreq: "monthly" }),
    urlEntry(`${BASE_URL}/tools/`, { priority: "0.7", changefreq: "monthly" }),
  ];

  const toolPages = TOOL_SLUGS.map((slug) =>
    urlEntry(`${BASE_URL}/tools/${slug}/`, { priority: "0.6", changefreq: "monthly" }),
  );

  const blogPages = articles.map((item) => {
    const lastmod = (item.updatedAt ?? item.createdAt ?? TODAY).split("T")[0];
    return urlEntry(`${BASE_URL}/blog/${item.id}/`, {
      lastmod,
      priority: "0.9",
      changefreq: "monthly",
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...toolPages, ...blogPages].join("\n")}
</urlset>
`;

  const outPath = resolve(__dirname, "../public/sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");
  console.log(`[sitemap] sitemap.xml generado con ${staticPages.length + toolPages.length + blogPages.length} URLs → ${outPath}`);
}

main().catch((err) => {
  console.error("[sitemap] Error fatal:", err);
  process.exit(1);
});
