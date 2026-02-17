import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import LandingHeader from "../components/layout/landing/LandingHeader";
import LandingSlider from "../components/layout/landing/LandingSlider";
import LandingBlogSlider from "../components/layout/landing/LandingBlogSlider";
import LandingSkillsSlider from "@/components/layout/landing/LandingSkills";
import LandingProjectsSlider from "../components/layout/landing/LandingProjects";
import LandingFooter from "../components/layout/landing/LandingFooter";
import ContactForm from "../components/common/ContactForm";
import ErrorAlert from "@/components/UI/ErrorAlert";
import { listPublicExperiences } from "@/api/experiences";
import { listPublicSkills } from "@/api/skills";
import { Experience } from "@/interfaces/Experience";
import { Skill } from "@/interfaces/Skill";
import { SliderItem } from "@/components/UI/Slider";
import { stripHtml } from "@/utils/html-content";

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

type SliderMappable = {
  id: string;
  title: string;
  summary: string;
  body: string;
  imageUrls: string[];
};

const mapToSliderItem = (item: SliderMappable, urlPrefix: string, ctaLabel: string): SliderItem => ({
  id: item.id,
  title: item.title,
  description: item.summary?.trim() || stripHtml(item.body ?? "").trim() || "Contenido en actualizacion.",
  image: item.imageUrls?.[0] ?? "",
  url: `${urlPrefix}${item.id}`,
  ctaLabel,
});

const selectItemsForSection = (
  items: Experience[],
  keywords: string[],
): SliderItem[] => {
  const normalizedKeywords = keywords.map(normalizeText);
  const matching = items.filter((item) => {
    const haystack = normalizeText(
      [item.title, item.summary, item.body, item.tags.join(" ")].join(" "),
    );
    return normalizedKeywords.some((keyword) => haystack.includes(keyword));
  });
  return matching.slice(0, 8).map((item) => mapToSliderItem(item, "/portfolio#exp-", "Ver experiencia"));
};

const Home = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [contentError, setContentError] = useState("");

  useEffect(() => {
    Promise.all([listPublicExperiences(), listPublicSkills()])
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
    () =>
      [...experiences].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [experiences],
  );

  const blogItems = useMemo(
    () =>
      selectItemsForSection(sortedExperiences, [
        "blog",
        "articulo",
        "observabilidad",
        "seguridad",
        "arquitectura",
      ]).map((item) => ({
        ...item,
        url: `/blog/${item.id}`,
        ctaLabel: "Leer articulo",
      })),
    [sortedExperiences],
  );

  const skillsItems = useMemo(
    () =>
      [...skills]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 8)
        .map((item) => mapToSliderItem(item, "/portfolio#skill-", "Ver capacidad")),
    [skills],
  );

  const projectsItems = useMemo(
    () =>
      selectItemsForSection(sortedExperiences, [
        "proyecto",
        "case",
        "implementacion",
        "platform",
        "producto",
      ]),
    [sortedExperiences],
  );

  return (
    <div className="min-h-screen bg-transparent text-text-primary">
      <Head>
        <title>Yonathan Gutierrez R | Consultoria Tecnologica</title>
        <meta
          name="description"
          content="Consultoria en desarrollo de productos digitales, infraestructura y seguridad con enfoque en resultados."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <LandingHeader />

      <main id="secciones-principales" className="pt-[72px] md:pt-[76px]">
        <LandingSlider />
        {contentError && (
          <section className="mx-auto w-full max-w-7xl px-4 pb-2 pt-8 md:px-8">
            <ErrorAlert message={contentError} className="text-sm" />
          </section>
        )}
        {isLoadingContent && (
          <section className="mx-auto w-full max-w-7xl px-4 pb-0 pt-8 md:px-8">
            <p className="rounded-xl border border-slate-700/75 bg-surface-800/55 px-4 py-3 text-sm text-text-secondary">
              Cargando contenido dinamico del CMS...
            </p>
          </section>
        )}
        <LandingBlogSlider dataCards={blogItems} />
        <LandingSkillsSlider dataSkills={skillsItems} />
        <LandingProjectsSlider dataProjects={projectsItems} />
      </main>
      <footer>
        <LandingFooter ContactForm={ContactForm} />
      </footer>
    </div>
  );
};

export default Home;
