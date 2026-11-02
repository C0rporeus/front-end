import CapabilitySlider from "@/components/content/CapabilitySlider";
import { type CapabilityItem } from "@/components/content/CapabilityTile";

type LandingSkillsSliderProps = {
  dataSkills: CapabilityItem[];
};

/** Capacidades en una fila deslizable, como artículos y proyectos; las tarjetas no navegan. */
const LandingSkillsSlider = ({ dataSkills }: LandingSkillsSliderProps) => (
  <section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8 md:py-12" aria-labelledby="seccion-skills">
    <h2 id="seccion-skills" className="articles-title mb-6 text-2xl font-bold tracking-tight text-text-primary md:text-4xl">
      Capacidades clave
    </h2>
    <CapabilitySlider
      title="Capacidades clave"
      labelledBy="seccion-skills"
      items={dataSkills}
      emptyMessage="No hay contenido publicado en esta sección todavía."
    />
  </section>
);

export default LandingSkillsSlider;
