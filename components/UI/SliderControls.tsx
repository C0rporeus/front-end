import { HorizontalSliderState } from "@/components/UI/useHorizontalSlider";

type SliderControlsProps = {
  title: string;
  slider: Omit<HorizontalSliderState, "trackRef">;
};

/** Flechas y puntos de paginación de un carril horizontal. */
const SliderControls = ({ title, slider }: SliderControlsProps) => (
  <>
    {slider.hasOverflow && (
      <>
        <button
          type="button"
          onClick={() => slider.scroll("prev")}
          className={`slider-button prev-button ${!slider.canScrollPrev ? "is-disabled" : ""}`}
          aria-label={`Ver ${title} anterior`}
          disabled={!slider.canScrollPrev}
        >
          {"<"}
        </button>
        <button
          type="button"
          onClick={() => slider.scroll("next")}
          className={`slider-button next-button ${!slider.canScrollNext ? "is-disabled" : ""}`}
          aria-label={`Ver ${title} siguiente`}
          disabled={!slider.canScrollNext}
        >
          {">"}
        </button>
      </>
    )}
    {slider.totalPages > 1 && (
      <div className="slider-pagination" aria-label={`Paginación de ${title}`}>
        {Array.from({ length: slider.totalPages }, (_, index) => (
          <button
            key={`page-${index}`}
            type="button"
            className={`slider-dot ${index === slider.currentPage ? "is-active" : ""}`}
            onClick={() => slider.goToPage(index)}
            aria-label={`Ir a página ${index + 1} de ${slider.totalPages}`}
            aria-current={index === slider.currentPage}
          />
        ))}
      </div>
    )}
  </>
);

export default SliderControls;
