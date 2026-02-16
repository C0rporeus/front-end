import Slider, { SliderItem } from "../../UI/Slider";

type LandingBlogSliderProps = {
  dataCards: SliderItem[];
};

const LandingBlogSlider = ({ dataCards }: LandingBlogSliderProps) => {
  return (
    <Slider
      sectionId="seccion-blog"
      title="Ultimos articulos"
      data={dataCards}
      introTag="Nuevo en la landing"
      introMessage="Explora ideas aplicables desde hoy: mejoras de arquitectura, observabilidad y seguridad en formato directo y accionable."
    />
  );
};

export default LandingBlogSlider;
