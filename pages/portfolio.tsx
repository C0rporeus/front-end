import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

import { listPublicExperiences } from "@/api/experiences";
import LandingHeader from "@/components/layout/landing/LandingHeader";
import { Experience } from "@/interfaces/Experience";
import CapabilityGrid from "@/components/content/CapabilityGrid";
import ExperienceTimeline from "@/components/content/ExperienceTimeline";
import PortfolioShowcaseCard from "@/components/content/PortfolioShowcaseCard";
import { filterByKind } from "@/utils/content-kind";

export default function PortfolioPage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPublicExperiences()
      .then((data) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const sections = useMemo(() => {
    const sorted = [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return {
      skills: filterByKind(sorted, "skill"),
      samples: filterByKind(sorted, "portfolio"),
      experiences: filterByKind(items, "experience").sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
  }, [items]);

  // Los anclajes (#skill-…, #exp-…) llegan antes que el contenido del CMS; se resuelven al cargar.
  useEffect(() => {
    if (loading || !window.location.hash) return;
    document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView({ block: "start" });
  }, [loading]);

  const isEmpty =
    sections.skills.length + sections.samples.length + sections.experiences.length === 0;

  return (
    <>
      <Head>
        <title>Portafolio | Portfolio Dev</title>
      </Head>
      <LandingHeader />
      <main className="public-main pt-[96px] md:pt-[104px]">
        <section className="public-page-shell mx-auto w-full max-w-5xl">
          <h1 className="public-title">Portafolio y experiencia</h1>
          <p className="public-lead">
            Selección de experiencias publicadas, enfocadas en impacto técnico y resultados.
          </p>
        </section>
        {loading && (
          <p className="mx-auto mt-6 w-full max-w-5xl text-text-secondary">Cargando experiencias...</p>
        )}
        {!loading && isEmpty && (
          <p className="mx-auto mt-6 w-full max-w-5xl text-text-secondary">
            Aún no hay experiencias publicadas. Puedes agregarlas desde el panel de administración.
          </p>
        )}
        {sections.skills.length > 0 && (
          <section className="content-section" aria-labelledby="portafolio-capacidades">
            <h2 id="portafolio-capacidades" className="content-section-heading">Capacidades</h2>
            <p className="content-section-lead">Áreas en las que aporto criterio técnico y el stack asociado.</p>
            <CapabilityGrid items={sections.skills} />
          </section>
        )}
        {sections.samples.length > 0 && (
          <section className="content-section" aria-labelledby="portafolio-muestras">
            <h2 id="portafolio-muestras" className="content-section-heading">Muestras</h2>
            <p className="content-section-lead">Trabajo entregado, con evidencia visual del resultado.</p>
            <div className="grid gap-4 md:gap-5">
              {sections.samples.map((item) => (
                <PortfolioShowcaseCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
        {sections.experiences.length > 0 && (
          <section className="content-section" aria-labelledby="portafolio-trayectoria">
            <h2 id="portafolio-trayectoria" className="content-section-heading">Trayectoria</h2>
            <p className="content-section-lead">Experiencias en orden cronológico: contexto, decisiones y resultado.</p>
            <ExperienceTimeline items={sections.experiences} />
          </section>
        )}
      </main>
    </>
  );
}
