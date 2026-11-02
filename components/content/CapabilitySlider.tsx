import SliderControls from "@/components/UI/SliderControls";
import { useHorizontalSlider } from "@/components/UI/useHorizontalSlider";
import { CapabilityItem, CapabilityTileContent } from "@/components/content/CapabilityTile";

type CapabilitySliderProps = {
  /** Nombre de la sección, para las etiquetas accesibles de los controles. */
  title: string;
  /** id del encabezado que nombra el carril (aria-labelledby). */
  labelledBy: string;
  items: CapabilityItem[];
  emptyMessage?: string;
};

/**
 * Capacidades en una sola fila con desplazamiento horizontal, flechas y puntos,
 * igual que los carruseles de artículos y proyectos. Las tarjetas no son enlaces:
 * una capacidad se lee en la propia tarjeta. Cada una mantiene el ancla
 * `skill-<id>` para los enlaces antiguos a /portfolio#skill-<id>.
 */
const CapabilitySlider = ({ title, labelledBy, items, emptyMessage }: CapabilitySliderProps) => {
  const { trackRef, ...slider } = useHorizontalSlider(items.length, ".capability-slide");

  if (items.length === 0) {
    return emptyMessage ? <p className="slider-empty-state">{emptyMessage}</p> : null;
  }

  return (
    <div className="slider-container capability-slider">
      <div ref={trackRef} className="landing-cards-track" role="region" aria-labelledby={labelledBy}>
        {items.map((item) => (
          <article key={item.id} id={`skill-${item.id}`} className="capability-tile capability-slide">
            <CapabilityTileContent item={item} />
          </article>
        ))}
      </div>
      <SliderControls title={title} slider={slider} />
    </div>
  );
};

export default CapabilitySlider;
