import React, { useState } from "react";
import Image from "next/image";

import SliderControls from "@/components/UI/SliderControls";
import { useHorizontalSlider } from "@/components/UI/useHorizontalSlider";

export type SliderItem = {
  id: string | number;
  image?: string;
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
};

const Slider = ({ title, sectionId, data, introTag, introMessage }: SliderProps) => {
  const { trackRef, ...slider } = useHorizontalSlider(data.length, ".landing-card-item");
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>(
    {},
  );

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
      {data.length === 0 && (
        <p className="slider-empty-state">
          No hay contenido publicado en esta sección todavía.
        </p>
      )}
      <div ref={trackRef} className="landing-cards-track" role="region" aria-labelledby={sectionId}>
        {data.map((item) => {
          const imageKey = String(item.id);
          const imageSrc = item.image?.trim() ?? "";
          const hasImage = imageSrc.length > 0;
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
                <Image
                  src={imageSrc}
                  alt={item.title}
                  className="landing-card-image"
                  width={400}
                  height={300}
                  onError={() => markImageAsFailed(item.id)}
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
