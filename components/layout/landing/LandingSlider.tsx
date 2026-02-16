import React, { useState } from "react";

const LandingSlider = () => {
  const slides = [
    {
      id: 1,
      title:
        "Consultoria estrategica en tecnologia, software e infraestructura",
      subtitle:
        "Diseno e implementacion de soluciones que conectan negocio, plataformas y seguridad de forma sostenible.",
      image: "https://source.unsplash.com/random/1920x1680?technology",
    },
    {
      id: 2,
      title: "Productos web y moviles orientados a resultados",
      subtitle:
        "Desde discovery hasta entrega continua, construyendo experiencias claras para usuarios y equipos.",
      image: "https://source.unsplash.com/random/1920x1680?coding",
    },
    {
      id: 3,
      title: "Infraestructura moderna y seguridad por diseno",
      subtitle:
        "Automatizacion, cloud, contenedores y buenas practicas de observabilidad para operar con confianza.",
      image: "https://source.unsplash.com/random/1920x1680?Hardware",
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
      className="relative isolate w-full overflow-hidden"
      role="region"
      aria-label="Carrusel principal de servicios"
      aria-roledescription="carousel"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 min-h-[68svh] bg-cover bg-center transition-opacity duration-500 md:min-h-[74svh] ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${slide.image})` }}
          aria-hidden={index !== currentSlide}
        >
          <div className="absolute inset-0 bg-slate-950/58" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-950/30 to-transparent" />
          <div className="relative mx-auto flex min-h-[68svh] w-full max-w-7xl items-center px-4 pb-14 pt-24 sm:px-5 md:min-h-[74svh] md:px-8 md:pt-28">
            <div className="max-w-3xl">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-400 md:text-sm">
                Tecnologia aplicada
              </p>
              <h1 className="slide-title">{slide.title}</h1>
              <p className="slide-subtitle">{slide.subtitle}</p>
              <a
                href="#secciones-principales"
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
