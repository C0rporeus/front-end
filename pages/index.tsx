import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import LandingHeader from "../components/layout/landing/LandingHeader";
import BoardHero from "@/components/board/BoardHero";
import PageSeo from "@/components/seo/PageSeo";
import { SITE_NAME, SITE_URL } from "@/utils/seo";
import LandingArticles, { type ArticleEntry } from "@/components/layout/landing/LandingArticles";
import LandingSkills from "@/components/layout/landing/LandingSkills";
import LandingProjects, { type ProjectEntry } from "@/components/layout/landing/LandingProjects";
import LandingFooter from "../components/layout/landing/LandingFooter";
import ContactForm from "../components/common/ContactForm";
import ErrorAlert from "@/components/UI/ErrorAlert";
import { listPublicExperienceCards } from "@/api/experiences";
import { listPublicSkills } from "@/api/skills";
import { Experience } from "@/interfaces/Experience";
import { Skill } from "@/interfaces/Skill";
import { extractFirstImageFromHtml, stripHtml } from "@/utils/html-content";
import { CONTENT_KIND_LABELS, filterByKind, resolveContentKind } from "@/utils/content-kind";
import { blogArticleHref } from "@/utils/blog-route";

const describe = (item: Experience) =>
  item.summary?.trim() || stripHtml(item.body ?? "").trim() || "Contenido en actualización.";

const coverOf = (item: Experience) => item.imageUrls?.[0] || extractFirstImageFromHtml(item.body ?? "") || "";

// Quién es el autor y qué es el sitio, para buscadores. Solo datos ya publicados en la página.
const HOME_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/brand/icon-192.png`,
    jobTitle: "Consultor tecnológico",
    description: "Diseño, construyo y opero sistemas de software: código, sistemas distribuidos, plataforma, seguridad y operación.",
    knowsAbout: ["Go", "Kubernetes", "Sistemas distribuidos", "Infraestructura como código", "Observabilidad", "Seguridad de red", "DNS"],
    sameAs: ["https://www.linkedin.com/in/yonathan-gutierrez-rodriguez-742a32bb/"],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "es",
  },
];

const Home = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [contentError, setContentError] = useState("");

  useEffect(() => {
    Promise.all([listPublicExperienceCards(), listPublicSkills()])
      .then(([experienceItems, skillItems]) => {
        setExperiences(experienceItems);
        setSkills(skillItems);
      })
      .catch(() =>
        setContentError(
          "No fue posible cargar el contenido del CMS por ahora. Reintenta en unos minutos.",
        ),
      )
      .finally(() => setIsLoadingContent(false));
  }, []);

  const sortedExperiences = useMemo(
    () => [...experiences].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [experiences],
  );

  // Cada sección filtra por tipo de contenido (tags), nunca por palabras del cuerpo,
  // para que una capacidad no reaparezca como artículo o proyecto.
  const blogItems = useMemo<ArticleEntry[]>(
    () =>
      [...filterByKind(experiences, "blog")]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6)
        .map((item) => ({
          id: item.id,
          title: item.title,
          description: describe(item),
          image: coverOf(item),
          thumb: item.thumbUrl || undefined,
          url: blogArticleHref(item.id),
          createdAt: item.createdAt,
        })),
    [experiences],
  );

  const skillsItems = useMemo(
    () => [...skills].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6),
    [skills],
  );

  const projectsItems = useMemo<ProjectEntry[]>(
    () =>
      filterByKind(sortedExperiences, "portfolio", "experience")
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          title: item.title,
          description: describe(item),
          image: coverOf(item),
          thumb: item.thumbUrl || undefined,
          url: `/portfolio#exp-${item.id}`,
          kind: CONTENT_KIND_LABELS[resolveContentKind(item)],
        })),
    [sortedExperiences],
  );

  return (
    <div className="min-h-screen bg-transparent text-text-primary">
      <PageSeo
        title="Yonathan Gutierrez | Software, sistemas distribuidos y operación"
        description="Diseño, construyo y opero sistemas de software. Artículos, proyectos y herramientas sobre desarrollo, sistemas distribuidos, plataforma, seguridad y operación."
        path="/"
        jsonLd={HOME_JSON_LD}
      />
      <Head>
        {/* Abre las conexiones antes de que el JS pida el contenido y las portadas. */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100"} crossOrigin="use-credentials" />
        <link rel="preconnect" href="https://storage.googleapis.com" />
      </Head>

      <LandingHeader />

      <main id="secciones-principales" className="home-main">
        <BoardHero />
        {contentError && (
          <div className="mx-auto w-full max-w-7xl px-4 pt-8 md:px-8">
            <ErrorAlert message={contentError} className="text-sm" />
          </div>
        )}
        <LandingArticles articles={blogItems} isLoading={isLoadingContent} />
        <LandingSkills dataSkills={skillsItems} isLoading={isLoadingContent} />
        <LandingProjects dataProjects={projectsItems} isLoading={isLoadingContent} />
      </main>
      <footer>
        <LandingFooter ContactForm={ContactForm} />
      </footer>
    </div>
  );
};

export default Home;
