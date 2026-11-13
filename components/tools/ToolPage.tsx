import type { ReactNode } from "react";

import PageSeo, { canonicalUrl } from "@/components/seo/PageSeo";
import ToolsLayout from "@/components/tools/ToolsLayout";
import { findToolBySlug } from "@/components/tools/tools-config";
import { TOOLS_SEO } from "@/components/tools/tools-seo";
import { SITE_NAME, SITE_URL } from "@/utils/seo";

type ToolPageProps = {
  slug: string;
  children: ReactNode;
};

/**
 * Página de una herramienta: metadatos, datos estructurados, la herramienta y,
 * debajo, su guía (qué es, usos y preguntas frecuentes) impresa en el HTML estático.
 */
const ToolPage = ({ slug, children }: ToolPageProps) => {
  const tool = findToolBySlug(slug);
  const seo = TOOLS_SEO[slug];
  if (!tool || !seo) throw new Error(`Herramienta sin configuración SEO: ${slug}`);

  const path = `/tools/${slug}/`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tool.label,
      description: seo.description,
      url: canonicalUrl(path),
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      inLanguage: "es",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@type": "Person", name: SITE_NAME, url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: canonicalUrl("/") },
        { "@type": "ListItem", position: 2, name: "Herramientas", item: canonicalUrl("/tools/") },
        { "@type": "ListItem", position: 3, name: tool.label, item: canonicalUrl(path) },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: seo.faq.map((entry) => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: { "@type": "Answer", text: entry.answer },
      })),
    },
  ];

  return (
    <>
      <PageSeo title={`${seo.title} | ${SITE_NAME}`} description={seo.description} path={path} jsonLd={jsonLd} />
      <ToolsLayout>
        {children}
        <section className="tool-guide" aria-labelledby="tool-guide-title">
          <h2 id="tool-guide-title" className="tool-guide-title">
            {seo.title}
          </h2>
          {seo.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <h3>Para qué sirve</h3>
          <ul>
            {seo.uses.map((use) => (
              <li key={use}>{use}</li>
            ))}
          </ul>
          <h3>Preguntas frecuentes</h3>
          <dl>
            {seo.faq.map((entry) => (
              <div key={entry.question}>
                <dt>{entry.question}</dt>
                <dd>{entry.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </ToolsLayout>
    </>
  );
};

export default ToolPage;
