import type { ReactNode } from "react";

import { useInView } from "@/components/UI/useInView";

type BoardSectionProps = {
  /** id del encabezado; es también el ancla de la sección. */
  headingId: string;
  title: string;
  lead?: string;
  /** Enlace o acción a la derecha del encabezado. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

/**
 * Sección de la home colgada de la línea principal del tablero: al entrar en
 * pantalla el tramo se energiza y la lámpara del encabezado se enciende.
 */
const BoardSection = ({ headingId, title, lead, action, className = "", children }: BoardSectionProps) => {
  const [ref, inView] = useInView<HTMLElement>(0.12);
  return (
    <section
      ref={ref}
      className={`board-section ${className}`.trim()}
      aria-labelledby={headingId}
      data-inview={inView}
    >
      <span className="board-section-rail" aria-hidden="true" />
      <div className="board-section-inner">
        <header className="board-section-header">
          <span className="board-section-lamp" aria-hidden="true" />
          <div>
            <h2 id={headingId} className="board-section-title">
              {title}
            </h2>
            {lead && <p className="board-section-lead">{lead}</p>}
          </div>
          {action && <div className="board-section-action">{action}</div>}
        </header>
        {children}
      </div>
    </section>
  );
};

export default BoardSection;
