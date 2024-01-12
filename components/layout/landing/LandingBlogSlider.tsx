import React, { useState, useRef } from "react";

// slider para mostrar tarjetas de blog con los ultimos posts publicados
const LandingBlogSlider = () => {
  //  TARJETAS DE BLOG
  const dataCards = [
    {
      id: 1,
      title: "Titulo del post 1",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?raspberrypi",
      url: "#",
    },
    {
      id: 2,
      title: "Titulo del post 2",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?opensource",
      url: "#",
    },
    {
      id: 3,
      title: "Titulo del post 3",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?esports",
      url: "#",
    },
    {
      id: 4,
      title: "Titulo del post 4",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?apple",
      url: "#",
    },
    {
      id: 5,
      title: "Titulo del post 5",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?Hardware",
      url: "#",
    },
    {
      id: 6,
      title: "Titulo del post 6",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?technology",
      url: "#",
    },
    {
      id: 7,
      title: "Titulo del post 7",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?coding",
      url: "#",
    },
    {
      id: 8,
      title: "Titulo del post 8",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?Hardware",
      url: "#",
    },
  ];

  const cardsContainerRef = useRef(null);

  const handleScroll = (direction: string) => {
    if (cardsContainerRef.current) {
      const cardWidth =
        (cardsContainerRef.current as HTMLElement).clientWidth / 3; // Ancho de una tarjeta
      const currentScroll = (cardsContainerRef.current as HTMLElement)
        .scrollLeft;

      const newScroll =
        direction === "next"
          ? currentScroll + cardWidth
          : currentScroll - cardWidth;

      (cardsContainerRef.current as HTMLElement).scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="slider-container">
        <h1 className="articles-title">Ultimos Articulos</h1>
      <div ref={cardsContainerRef} className="cards-container">
        {dataCards.map((card) => (
          <div key={card.id} className="card">
            <img src={card.image} alt="Post" className="card-image" />
            <div className="card-content">
              <h1 className="card-title">{card.title}</h1>
              <p className="card-description">{card.description}</p>
              <button className="card-button">Leer Más</button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => handleScroll("prev")}
        className="slider-button prev-button glitch-button"
        data-text="<"
      >
        {"<"}
      </button>
      <button
        onClick={() => handleScroll("next")}
        className="slider-button next-button glitch-button"
        data-text=">"
      >
        {">"}
      </button>
    </div>
  );
};

export default LandingBlogSlider;
