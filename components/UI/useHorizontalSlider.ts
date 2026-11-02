import { RefObject, useCallback, useEffect, useRef, useState } from "react";

/** Tarjetas visibles por breakpoint; coincide con .landing-cards-track (1 / 2 / 3 columnas). */
export function resolveCardsPerView(width: number): number {
  if (width >= 1024) return 3;
  if (width >= 768) return 2;
  return 1;
}

export type HorizontalSliderState = {
  trackRef: RefObject<HTMLDivElement | null>;
  hasOverflow: boolean;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  currentPage: number;
  totalPages: number;
  scroll: (direction: "next" | "prev") => void;
  goToPage: (pageIndex: number) => void;
};

/**
 * Estado y acciones de un carril horizontal paginado (flechas y puntos).
 * itemSelector identifica las tarjetas del carril para medir el ancho de una página.
 */
export function useHorizontalSlider(itemCount: number, itemSelector: string): HorizontalSliderState {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const getPageWidth = useCallback(
    (track: HTMLDivElement) => {
      const firstCard = track.querySelector<HTMLElement>(itemSelector);
      if (!firstCard) return track.clientWidth;
      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "16") || 16;
      const perView = resolveCardsPerView(window.innerWidth);
      return firstCard.clientWidth * perView + gap * (perView - 1);
    },
    [itemSelector],
  );

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const tolerancePx = 2;
    const overflow = maxScroll > tolerancePx;
    const pageWidth = getPageWidth(track);

    setHasOverflow(overflow);
    setCanScrollPrev(overflow && track.scrollLeft > tolerancePx);
    setCanScrollNext(overflow && track.scrollLeft < maxScroll - tolerancePx);
    setTotalPages(Math.max(1, Math.ceil(itemCount / resolveCardsPerView(window.innerWidth))));
    setCurrentPage(overflow && pageWidth > 0 ? Math.round(track.scrollLeft / pageWidth) : 0);
  }, [getPageWidth, itemCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    update();
    track.addEventListener("scroll", update, { passive: true });
    const resizeObserver = new ResizeObserver(() => update());
    resizeObserver.observe(track);
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      resizeObserver.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = (direction: "next" | "prev") => {
    const track = trackRef.current;
    if (!track) return;
    const pageWidth = getPageWidth(track);
    const step = pageWidth > 0 ? pageWidth : track.clientWidth;
    track.scrollTo({ left: track.scrollLeft + (direction === "next" ? step : -step), behavior: "smooth" });
    window.setTimeout(update, 220);
  };

  const goToPage = (pageIndex: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: Math.max(0, pageIndex) * getPageWidth(track), behavior: "smooth" });
    window.setTimeout(update, 220);
  };

  return { trackRef, hasOverflow, canScrollPrev, canScrollNext, currentPage, totalPages, scroll, goToPage };
}
