import Slider, { SliderItem } from "@/components/UI/Slider";

type LandingProjectsSliderProps = {
  dataProjects: SliderItem[];
  isLoading?: boolean;
};

const LandingProjectsSlider = ({ dataProjects, isLoading }: LandingProjectsSliderProps) => {
  return <Slider sectionId="seccion-proyectos" title="Proyectos destacados" data={dataProjects} isLoading={isLoading} />;
};

export default LandingProjectsSlider;
