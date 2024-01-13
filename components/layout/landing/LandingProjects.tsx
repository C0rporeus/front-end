import Slider from "@/components/UI/Slider";
import React, { useState, useRef } from "react";

// slider para mostrar tarjetas de blog con los ultimos posts publicados
const LandingProjectsSlider = () => {
  //  TARJETAS DE BLOG
  const dataProjects = [
    {
      id: 1,
      title: "Proyecto del post 1",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?infraestructure",
      url: "#",
    },
    {
      id: 2,
      title: "Proyecto del post 2",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?iot",
      url: "#",
    },
    {
      id: 3,
      title: "Proyecto del post 3",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?automation",
      url: "#",
    },
    {
      id: 4,
      title: "Proyecto del post 4",
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

  return <Slider title="Proyectos" data={dataProjects} cardWidthFactor={3} />;
};

export default LandingProjectsSlider;
