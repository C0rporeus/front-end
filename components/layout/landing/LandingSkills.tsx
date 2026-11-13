import Link from "next/link";

import BoardSection from "@/components/board/BoardSection";
import { CapabilityTileContent, type CapabilityItem } from "@/components/content/CapabilityTile";

type LandingSkillsProps = {
  dataSkills: CapabilityItem[];
  isLoading?: boolean;
};

/** Capacidades como bloques derivados de un mismo bus; se leen en la propia tesela, no navegan. */
const LandingSkills = ({ dataSkills, isLoading = false }: LandingSkillsProps) => {
  const showSkeleton = isLoading && dataSkills.length === 0;
  return (
    <BoardSection
      headingId="seccion-skills"
      title="Capacidades"
      lead="Áreas en las que aporto criterio técnico, con el stack que uso en cada una."
      action={
        <Link href="/portfolio" className="route-link">
          Ver trayectoria
        </Link>
      }
    >
      {!showSkeleton && dataSkills.length === 0 && (
        <p className="board-empty">Todavía no hay capacidades publicadas.</p>
      )}
      {(showSkeleton || dataSkills.length > 0) && (
        <ul className="capability-bus" aria-busy={showSkeleton}>
          {showSkeleton
            ? [0, 1, 2].map((index) => (
                <li key={index} className="capability-tile capability-skeleton" aria-hidden="true" />
              ))
            : dataSkills.map((item) => (
                <li key={item.id} id={`skill-${item.id}`} className="capability-tile">
                  <CapabilityTileContent item={item} />
                </li>
              ))}
        </ul>
      )}
    </BoardSection>
  );
};

export default LandingSkills;
