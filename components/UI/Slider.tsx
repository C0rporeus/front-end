import React, { useState } from "react";

import FadeImage from "@/components/UI/FadeImage";
import SliderControls from "@/components/UI/SliderControls";
import { useHorizontalSlider } from "@/components/UI/useHorizontalSlider";

export type SliderItem = {
  id: string | number;
  image?: string;
  /** Miniatura de 640 px; si existe se ofrece junto a `image` vía srcset. */
  thumb?: string;
  title: string;
  description: string;
  url?: string;
  ctaLabel?: string;
};

type SliderProps = {
  title: string;
  sectionId: string;
  data: SliderItem[];
  introTag?: string;
  introMessage?: string;
  /** Mientras llega el contenido se reservan tarjetas del mismo tamaño para no mover el layout (CLS). */
  isLoading?: boolean;
};

const SKELETON_CARDS = 3;
/** Ancho de tarjeta por breakpoint (coincide con .landing-cards-track: 1 / 2 / 3 columnas). */
const CARD_IMAGE_SIZES = "(min-width: 1024px) 380px, (min-width: 768px) 46vw, 86vw";

const Slider = ({ title, sectionId, data, introTag, introMessage, isLoading = false }: SliderProps) => {
  const { trackRef, ...slider } = useHorizontalSlider(data.length, ".landing-card-item");
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>(
    {},
  );

  const [failedThumbs, setFailedThumbs] = useState<Record<string, boolean>>({});

  const markImageAsFailed = (itemId: string | number) => {
    const imageKey = String(itemId);
    setFailedImages((previous) =>
      previous[imageKey] ? previous : { ...previous, [imageKey]: true },
    );
  };

  return (
    <section className="slider-container mx-auto w-full max-w-7xl px-4 py-10 md:px-8 md:py-12" aria-label={`Carrusel ${title}`}>
      {(introTag || introMessage) && (
        <div className="slider-intro" role="note" aria-label={`Introduccion para ${title}`}>
          {introTag && <p className="slider-intro-tag">{introTag}</p>}
          {introMessage && <p className="slider-intro-message">{introMessage}</p>}
        </div>
      )}
      <h2 id={sectionId} className="articles-title mb-6 text-2xl font-bold tracking-tight text-text-primary md:text-4xl">
        {title}
      </h2>
      {data.length === 0 && !isLoading && (
        <p className="slider-empty-state">
          No hay contenido publicado en esta sección todavía.
        </p>
      )}
      <div
        ref={trackRef}
        className="landing-cards-track"
        role="region"
        aria-labelledby={sectionId}
        aria-busy={isLoading}
      >
        {isLoading &&
          data.length === 0 &&
          Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <article key={`skeleton-${index}`} className="landing-card-item landing-card-skeleton" aria-hidden="true">
              <div className="landing-card-image fade-image" />
              <div className="landing-card-content">
                <div className="landing-card-title" />
                <div className="landing-card-description" />
                <div className="landing-card-button landing-card-button-skeleton" />
              </div>
            </article>
          ))}
        {data.map((item, index) => {
          const imageKey = String(item.id);
          const imageSrc = item.image?.trim() ?? "";
          const hasImage = imageSrc.length > 0;
          const thumbSrc = item.thumb?.trim() ?? "";
          const useThumb = thumbSrc.length > 0 && hasImage && !failedThumbs[imageKey];
          const shouldShowFallback = !hasImage || Boolean(failedImages[imageKey]);

          return (
            <article key={item.id} className="landing-card-item">
              {shouldShowFallback ? (
                <div
                  className="landing-card-image landing-card-image-fallback"
                  role="img"
                  aria-label={`Imagen no disponible para ${item.title}`}
                >
                  <span>Imagen no disponible</span>
                </div>
              ) : (
                <FadeImage
                  src={useThumb ? thumbSrc : imageSrc}
                  srcSet={useThumb ? `${thumbSrc} 640w, ${imageSrc} 1200w` : undefined}
                  sizes={useThumb ? CARD_IMAGE_SIZES : undefined}
                  alt={item.title}
                  wrapperClassName="landing-card-image"
                  priority={index < 3}
                  onError={() =>
                    useThumb
                      ? setFailedThumbs((previous) => ({ ...previous, [imageKey]: true }))
                      : markImageAsFailed(item.id)
                  }
                />
              )}
              <div className="landing-card-content">
                <h3 className="landing-card-title">{item.title}</h3>
                <p className="landing-card-description">{item.description}</p>
                <a href={item.url ?? "/portfolio"} className="landing-card-button">
                  {item.ctaLabel ?? "Ver detalle"}
                </a>
              </div>
            </article>
          );
        })}
      </div>
      <SliderControls title={title} slider={slider} />
    </section>
  );
};

export default Slider;
