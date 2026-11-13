import Head from "next/head";

import { SITE_NAME, SITE_URL } from "@/utils/seo";

/** Imagen por defecto para tarjetas sociales: el isotipo (tarjeta pequeña). */
const DEFAULT_IMAGE = `${SITE_URL}/brand/icon-192.png`;

type PageSeoProps = {
  /** Título completo de la pestaña y del resultado de búsqueda. */
  title: string;
  description: string;
  /** Ruta canónica con barra final, p. ej. "/tools/base64/". */
  path: string;
  type?: "website" | "profile";
  /** Bloques schema.org; cada uno se emite como un <script type="application/ld+json">. */
  jsonLd?: ReadonlyArray<Record<string, unknown>>;
};

/** Convierte una ruta del sitio en su URL canónica absoluta. */
export const canonicalUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

// "<" escapado para que ningún texto pueda cerrar el <script>.
const serializeJsonLd = (data: Record<string, unknown>) => JSON.stringify(data).replace(/</g, "\\u003c");

/**
 * Metadatos de una página pública: título, descripción, canónica, Open Graph,
 * tarjeta de Twitter y datos estructurados. Todo queda en el HTML estático.
 */
const PageSeo = ({ title, description, path, type = "website", jsonLd = [] }: PageSeoProps) => {
  const url = canonicalUrl(path);
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="es_LA" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={DEFAULT_IMAGE} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />
      {jsonLd.map((block, index) => (
        <script
          key={`ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(block) }}
        />
      ))}
    </Head>
  );
};

export default PageSeo;
