import Slider, { SliderItem } from "@/components/UI/Slider";

type LandingSkillsSliderProps = {
  dataSkills: SliderItem[];
};

const LandingSkillsSlider = ({ dataSkills }: LandingSkillsSliderProps) => {
  return <Slider sectionId="seccion-skills" title="Capacidades clave" data={dataSkills} />;
};

export default LandingSkillsSlider;
