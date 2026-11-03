import React, { useState } from "react";

const LandingSlider = () => {
  const slides = [
    {
      id: 1,
      title:
        "Consultoría estratégica en tecnología, software e infraestructura",
      subtitle:
        "Diseño e implementación de soluciones que conectan negocio, plataformas y seguridad de forma sostenible.",
    },
    {
      id: 2,
      title: "Productos web y móviles orientados a resultados",
      subtitle:
        "Desde discovery hasta entrega continua, construyendo experiencias claras para usuarios y equipos.",
    },
    {
      id: 3,
      title: "Infraestructura moderna y seguridad por diseño",
      subtitle:
        "Automatización, cloud, contenedores y buenas prácticas de observabilidad para operar con confianza.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <section
      className="relative isolate grid w-full overflow-hidden"
      role="region"
      aria-label="Carrusel principal de servicios"
      aria-roledescription="carousel"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`relative col-start-1 row-start-1 flex bg-[radial-gradient(circle_at_20%_20%,#24406b_0%,#15243d_55%,#0d1729_100%)] transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={index !== currentSlide}
          inert={index !== currentSlide}
        >
          <div className="absolute inset-0 bg-slate-950/58" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-950/30 to-transparent" />
          {/* La altura la define el contenido (grid apilado) con un mínimo por dispositivo; el padding lateral deja libres las flechas. */}
          <div className="relative mx-auto flex min-h-[28rem] w-full max-w-7xl items-center px-14 py-14 sm:min-h-[30rem] md:min-h-[min(34rem,72svh)] md:px-24 md:py-20 lg:px-28">
            <div className="max-w-3xl">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-400 md:text-sm">
                Tecnología aplicada
              </p>
              {index === currentSlide ? (
                <h1 className="slide-title">{slide.title}</h1>
              ) : (
                <p className="slide-title">{slide.title}</p>
              )}
              <p className="slide-subtitle">{slide.subtitle}</p>
              <a
                href="#seccion-blog"
                className="mt-8 inline-flex min-h-11 items-center rounded-lg border border-brand-400/70 bg-brand-500/25 px-5 py-3 text-sm font-semibold text-text-primary shadow-soft hover:bg-brand-500/35 focus-visible:ring-2 focus-visible:ring-brand-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900"
              >
                Explorar servicios
              </a>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={prevSlide}
        className="slider-nav-button prev absolute left-3 top-1/2 z-40 -translate-y-1/2 md:left-6"
        aria-label="Ver slide anterior"
      >
        <span aria-hidden="true">{"<"}</span>
      </button>

      <button
        type="button"
        onClick={nextSlide}
        className="slider-nav-button next absolute right-3 top-1/2 z-40 -translate-y-1/2 md:right-6"
        aria-label="Ver slide siguiente"
      >
        <span aria-hidden="true">{">"}</span>
      </button>
    </section>
  );
};

export default LandingSlider;
