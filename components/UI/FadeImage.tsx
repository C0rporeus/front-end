import { SyntheticEvent, useEffect, useRef, useState } from "react";

type FadeImageProps = {
  src: string;
  alt: string;
  /** Clases del contenedor: aquí se define el tamaño (alto/ancho), el contenedor aloja el placeholder. */
  wrapperClassName?: string;
  /** Imagen visible sin desplazarse: se pide ya y con prioridad alta en lugar de al acercarse. */
  priority?: boolean;
  /** Candidatos responsive (`url 640w, url 1200w`); el navegador elige según ancho y densidad. */
  srcSet?: string;
  sizes?: string;
  onError?: () => void;
};

/**
 * Imagen que se revela completa con un fade.
 *
 * El navegador pinta las imágenes mientras descargan (de nada a parcial a completa).
 * Aquí la imagen permanece invisible sobre un placeholder y solo se muestra cuando está
 * descargada y decodificada. Cubre además imágenes que ya estaban en caché antes de
 * que React asignara el evento `load`, que de otro modo se quedarían invisibles.
 */
const FadeImage = ({ src, alt, wrapperClassName = "", priority = false, srcSet, sizes, onError }: FadeImageProps) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loadedSrc, setLoadedSrc] = useState("");

  const reveal = (img: HTMLImageElement) => {
    // decode() resuelve cuando la imagen está lista para pintarse sin trabajo extra.
    const decoded = typeof img.decode === "function" ? img.decode().catch(() => undefined) : Promise.resolve();
    void decoded.then(() => setLoadedSrc(src));
  };

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) reveal(img);
    // reveal depende solo de src; se evalúa al cambiar la imagen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const loaded = loadedSrc === src;

  return (
    <span className={`fade-image${loaded ? " is-loaded" : ""} ${wrapperClassName}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element -- URLs firmadas externas, sin optimización */}
      <img
        ref={imgRef}
        className="fade-image-img"
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={(event: SyntheticEvent<HTMLImageElement>) => reveal(event.currentTarget)}
        onError={onError}
      />
    </span>
  );
};

export default FadeImage;
