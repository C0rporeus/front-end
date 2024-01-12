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
      image: "https://source.unsplash.com/random/1920x1680?raspberrypi",
      url: "#",
    },
    {
      id: 2,
      title: "Titulo del skills 2",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?opensource",
      url: "#",
    },
    {
      id: 3,
      title: "Titulo del skills 3",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
      image: "https://source.unsplash.com/random/1920x1680?esports",
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
      image: "https://source.unsplash.com/random/1920x1680?Hardware",
      url: "#",
    },
  ];

  const skillsContainerRef = useRef(null);

  const handleScroll = (direction: string) => {
    if (skillsContainerRef.current) {
      const skillWidth =
        (skillsContainerRef.current as HTMLElement).clientWidth / 3;
      const currentScroll = (skillsContainerRef.current as HTMLElement)
        .scrollLeft;

      const newScroll =
        direction === "next"
          ? currentScroll + skillWidth
          : currentScroll - skillWidth;

      (skillsContainerRef.current as HTMLElement).scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="slider-container">
        <h1 className="skills-title">Skills</h1>
      <div ref={skillsContainerRef} className="skills-container">
        {dataSkills.map((skill) => (
          <div key={skill.id} className="skill">
            <img src={skill.image} alt="Post" className="skill-image" />
            <div className="skill-content">
              <h1 className="skill-title">{skill.title}</h1>
              <p className="skill-description">{skill.description}</p>
              <button className="skill-button">Leer Más</button>
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

export default LandingSkillsSlider;
