import Slider from "@/components/UI/Slider";
import React, { useState, useRef } from "react";

// slider para mostrar tarjetas de blog con los ultimos posts publicados
const LandingSkillsSlider = () => {
  //
  const dataSkills = [
    {
      id: 1,
      title: "Titulo del skills 1",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?c#language",
      url: "#",
    },
    {
      id: 2,
      title: "Titulo del skills 2",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?programming",
      url: "#",
    },
    {
      id: 3,
      title: "Titulo del skills 3",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?javascript",
      url: "#",
    },
    {
      id: 4,
      title: "Titulo del skills 4",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?apple",
      url: "#",
    },
    {
      id: 5,
      title: "Titulo del skills 5",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?Hardware",
      url: "#",
    },
    {
      id: 6,
      title: "Titulo del skills 6",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?technology",
      url: "#",
    },
    {
      id: 7,
      title: "Titulo del skills 7",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?coding",
      url: "#",
    },
    {
      id: 8,
      title: "Titulo del skills 8",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?Python",
      url: "#",
    },
  ];

  return <Slider title="Skills" data={dataSkills} cardWidthFactor={3} />;
};

export default LandingSkillsSlider;
