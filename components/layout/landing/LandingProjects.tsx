import Link from "next/link";
import { useState } from "react";

import BoardSection from "@/components/board/BoardSection";
import FadeImage from "@/components/UI/FadeImage";

export type ProjectEntry = {
  id: string;
  title: string;
  description: string;
  image: string;
  thumb?: string;
  url: string;
  /** "Muestra" o "Experiencia", según el tipo de contenido. */
  kind: string;
};

type LandingProjectsProps = {
  dataProjects: ProjectEntry[];
  isLoading?: boolean;
};

function ProjectTile({ project, featured }: { project: ProjectEntry; featured: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(project.image) && !imageFailed;
  return (
    <li className={`project-tile${featured ? " is-featured" : ""}${hasImage ? "" : " is-plain"}`}>
      <Link href={project.url} className="project-tile-link">
        {hasImage && (
          <FadeImage
            src={project.thumb && !featured ? project.thumb : project.image}
            alt=""
            wrapperClassName="project-tile-image"
            onError={() => setImageFailed(true)}
          />
        )}
        <span className="project-tile-plate">
          <span className="project-tile-kind">
            <span className="lamp" aria-hidden="true" />
            {project.kind}
          </span>
          <span className="project-tile-title">{project.title}</span>
          <span className="project-tile-summary">{project.description}</span>
        </span>
      </Link>
    </li>
  );
}

/** Proyectos como teselas grandes: la primera ocupa el doble y la imagen manda. */
const LandingProjects = ({ dataProjects, isLoading = false }: LandingProjectsProps) => {
  const showSkeleton = isLoading && dataProjects.length === 0;
  return (
    <BoardSection
      headingId="seccion-proyectos"
      title="Proyectos y experiencia"
      lead="Trabajo que se puede inspeccionar: contexto, decisiones y resultado."
      action={
        <Link href="/portfolio" className="route-link">
          Portafolio completo
        </Link>
      }
    >
      {!showSkeleton && dataProjects.length === 0 && (
        <p className="board-empty">Todavía no hay proyectos publicados.</p>
      )}
      {(showSkeleton || dataProjects.length > 0) && (
        <ul className="project-grid" aria-busy={showSkeleton}>
          {showSkeleton
            ? [0, 1, 2].map((index) => (
                <li
                  key={index}
                  className={`project-tile project-skeleton${index === 0 ? " is-featured" : ""}`}
                  aria-hidden="true"
                />
              ))
            : dataProjects.map((project, index) => (
                <ProjectTile key={project.id} project={project} featured={index === 0} />
              ))}
        </ul>
      )}
    </BoardSection>
  );
};

export default LandingProjects;
