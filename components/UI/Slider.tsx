import React, { useRef } from "react";
import Image from "next/image";

const Slider = ({ title, data, cardWidthFactor }: { title: string, data: any[], cardWidthFactor: number }) => {
  const sliderContainerRef = useRef(null);

const handleScroll = (direction: string) => {
    if (sliderContainerRef.current) {
      const elementWidth =
        (sliderContainerRef.current as HTMLElement).clientWidth / cardWidthFactor;
    const currentScroll = (sliderContainerRef.current as HTMLElement).scrollLeft;
      const newScroll =
        direction === "next"
          ? currentScroll + elementWidth
          : currentScroll - elementWidth;

    (sliderContainerRef.current as HTMLElement).scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="slider-container">
      <h1 className="articles-title">{title}</h1>
      <div ref={sliderContainerRef} className="cards-container">
        {data.map((item) => (
          <div key={item.id} className="card">
            <Image src={item.image} alt={item.title} className="card-image" width={400} height={300} />
            <div className="card-content">
              <h1 className="card-title">{item.title}</h1>
              <p className="card-description">{item.description}</p>
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

export default Slider;
