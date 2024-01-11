import React, { useState } from "react";

const LandingSlider = () => {
  const slides = [
    {
      id: 1,
      title:
        "Consultoria en implementacion de tecnologias no solo de software sino tambien de Hardware",
      subtitle:
        "Soluciones integrales para la resolucion de retos y problemas en el ambito empresarial y estrategico de multiples organizaciones.",
      image: "https://source.unsplash.com/random/1920x1680?technology",
    },
    {
      id: 2,
      title: "Desarrollo de aplicaciones web y moviles",
      subtitle:
        "Resolucion de problemas con controles basados en software, ajuste de procedimientos y procesos.",
      image: "https://source.unsplash.com/random/1920x1680?coding",
    },
    {
      id: 3,
      title: "Aprovisionamiento de infraestructura y estrategias de seguridad",
      subtitle:
        "Tecnologias como kubernetes, docker, virtualizacion, cloud computing, etc.",
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
    <div className="w-full overflow-hidden relative h-[600px]">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute w-full h-full bg-cover bg-center transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <h1 className="slide-title">{slide.title}</h1>
          <br />
          <h2 className="slide-subtitle">{slide.subtitle}</h2>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 z-40 -translate-y-1/2 glitch-button prev glitch"
        data-text="<"
      >
        {"<"}
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 z-40 -translate-y-1/2 glitch-button next glitch"
        data-text=">"
      >
        {">"}
      </button>
    </div>
  );
};

export default LandingSlider;
