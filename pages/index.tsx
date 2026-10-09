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
import { extractFirstImageFromHtml, stripHtml } from "@/utils/html-content";
import { filterByKind, resolveContentKind } from "@/utils/content-kind";

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
      description: item.summary?.trim() || stripHtml(item.body ?? "").trim() || "Contenido en actualización.",
  image: item.imageUrls?.[0] || extractFirstImageFromHtml(item.body ?? "") || "",
  url: `${urlPrefix}${item.id}`,
  ctaLabel,
});


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
    () => [...experiences].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [experiences],
  );

  // Cada sección filtra por tipo de contenido (tags), nunca por palabras del cuerpo,
  // para que una capacidad no reaparezca como artículo o proyecto.
  const blogItems = useMemo(
    () =>
      filterByKind(sortedExperiences, "blog")
        .slice(0, 8)
        .map((item) => mapToSliderItem(item, "/blog/", "Leer artículo")),
    [sortedExperiences],
  );

  const skillsItems = useMemo(
    () => [...skills].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6),
    [skills],
  );

  const projectsItems = useMemo(
    () =>
      filterByKind(sortedExperiences, "portfolio", "experience")
        .slice(0, 8)
        .map((item) =>
          mapToSliderItem(
            item,
            "/portfolio#exp-",
            resolveContentKind(item) === "portfolio" ? "Ver muestra" : "Ver experiencia",
          ),
        ),
    [sortedExperiences],
  );

  return (
    <div className="min-h-screen bg-transparent text-text-primary">
      <Head>
        <title>Yonathan Gutierrez | Software, infraestructura y seguridad</title>
        <meta
          name="description"
          content="Artículos y proyectos sobre ingeniería de software, infraestructura, seguridad y operación de sistemas."
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
