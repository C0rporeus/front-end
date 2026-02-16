import Slider, { SliderItem } from "@/components/UI/Slider";

type LandingProjectsSliderProps = {
  dataProjects: SliderItem[];
};

const LandingProjectsSlider = ({ dataProjects }: LandingProjectsSliderProps) => {
  return <Slider sectionId="seccion-proyectos" title="Proyectos destacados" data={dataProjects} />;
};

export default LandingProjectsSlider;
