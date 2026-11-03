import Slider, { SliderItem } from "../../UI/Slider";

type LandingBlogSliderProps = {
  dataCards: SliderItem[];
  isLoading?: boolean;
};

const LandingBlogSlider = ({ dataCards, isLoading }: LandingBlogSliderProps) => {
  return (
    <Slider
      sectionId="seccion-blog"
      title="Últimos artículos"
      data={dataCards}
      isLoading={isLoading}
      introTag="Nuevo en la landing"
      introMessage="Explora ideas aplicables desde hoy: mejoras de arquitectura, observabilidad y seguridad en formato directo y accionable."
    />
  );
};

export default LandingBlogSlider;
