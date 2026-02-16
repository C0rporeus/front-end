import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

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
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>(
    {},
  );
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const resolveCardsPerView = useCallback(() => {
    if (typeof window === "undefined") return 1;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }, []);

  const getPageWidth = useCallback((slider: HTMLDivElement) => {
    const firstCard = slider.querySelector<HTMLElement>(".landing-card-item");
    if (!firstCard) return slider.clientWidth;
    const styles = window.getComputedStyle(slider);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "16") || 16;
    const perView = resolveCardsPerView();
    return firstCard.clientWidth * perView + gap * (perView - 1);
  }, [resolveCardsPerView]);

  const updateScrollState = useCallback(() => {
    const slider = sliderContainerRef.current;
    if (!slider) return;

    const maxScroll = slider.scrollWidth - slider.clientWidth;
    const tolerancePx = 2;
    const hasOverflow = maxScroll > tolerancePx;
    const perView = resolveCardsPerView();
    const pageWidth = getPageWidth(slider);

    setCardsPerView(perView);
    setHasHorizontalOverflow(hasOverflow);
    setCanScrollPrev(hasOverflow && slider.scrollLeft > tolerancePx);
    setCanScrollNext(hasOverflow && slider.scrollLeft < maxScroll - tolerancePx);
    setTotalPages(Math.max(1, Math.ceil(data.length / perView)));
    setCurrentPage(hasOverflow && pageWidth > 0 ? Math.round(slider.scrollLeft / pageWidth) : 0);
  }, [data.length, getPageWidth, resolveCardsPerView]);

  useEffect(() => {
    const slider = sliderContainerRef.current;
    if (!slider) return;

    updateScrollState();
    slider.addEventListener("scroll", updateScrollState, { passive: true });

    const resizeObserver = new ResizeObserver(() => updateScrollState());
    resizeObserver.observe(slider);
    window.addEventListener("resize", updateScrollState);

    return () => {
      slider.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const handleScroll = (direction: "next" | "prev") => {
    if (sliderContainerRef.current) {
      const slider = sliderContainerRef.current;
      const pageWidth = getPageWidth(slider);
      const step = pageWidth > 0 ? pageWidth : slider.clientWidth;
      const currentScroll = slider.scrollLeft;
      const newScroll =
        direction === "next"
          ? currentScroll + step
          : currentScroll - step;

      slider.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });

      window.setTimeout(updateScrollState, 220);
    }
  };

  const goToPage = (pageIndex: number) => {
    const slider = sliderContainerRef.current;
    if (!slider) return;

    const pageWidth = getPageWidth(slider);
    slider.scrollTo({
      left: Math.max(0, pageIndex) * pageWidth,
      behavior: "smooth",
    });

    window.setTimeout(updateScrollState, 220);
  };

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
          No hay contenido publicado en esta seccion todavia.
        </p>
      )}
      <div ref={sliderContainerRef} className="landing-cards-track" role="region" aria-labelledby={sectionId}>
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
      {hasHorizontalOverflow && (
        <>
          <button
            type="button"
            onClick={() => handleScroll("prev")}
            className={`slider-button prev-button ${!canScrollPrev ? "is-disabled" : ""}`}
            aria-label={`Ver ${title} anterior`}
            disabled={!canScrollPrev}
          >
            {"<"}
          </button>
          <button
            type="button"
            onClick={() => handleScroll("next")}
            className={`slider-button next-button ${!canScrollNext ? "is-disabled" : ""}`}
            aria-label={`Ver ${title} siguiente`}
            disabled={!canScrollNext}
          >
            {">"}
          </button>
        </>
      )}
      {totalPages > 1 && (
        <div className="slider-pagination" aria-label={`Paginacion de ${title}`}>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={`page-${index}`}
              type="button"
              className={`slider-dot ${index === currentPage ? "is-active" : ""}`}
              onClick={() => goToPage(index)}
              aria-label={`Ir a pagina ${index + 1} de ${Math.max(totalPages, Math.ceil(data.length / cardsPerView))}`}
              aria-current={index === currentPage}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Slider;
