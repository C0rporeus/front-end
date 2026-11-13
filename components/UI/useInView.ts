import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Indica si el elemento ya entró en pantalla. Se queda en `true` una vez visto:
 * sirve para encender una lámpara, no para ocultar contenido.
 */
export function useInView<T extends Element>(threshold = 0.2): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold, rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [inView, threshold]);

  return [ref, inView];
}
