import React, { useState, useRef } from "react";
import Slider from "../../UI/Slider";

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
  return (
    <Slider title="Ultimos articulos" data={dataCards} cardWidthFactor={3} />
  );
};

export default LandingBlogSlider;
