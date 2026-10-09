import RichTextViewer from "@/components/UI/RichTextViewer";
import type { Experience } from "@/interfaces/Experience";
import { visibleTags } from "@/utils/content-kind";

type ExperienceTimelineProps = {
  items: Experience[];
};

const formatPeriod = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("es-CL", { month: "short", year: "numeric" }).format(parsed);
};

/** Experiencias como trayectoria: fecha, contexto y stack; las imágenes son evidencia secundaria. */
const ExperienceTimeline = ({ items }: ExperienceTimelineProps) => (
  <ol className="experience-timeline">
    {items.map((item) => {
      const period = formatPeriod(item.createdAt);
      const tags = visibleTags(item);
      return (
        <li key={item.id} id={`exp-${item.id}`} className="experience-entry">
          <span className="experience-dot" aria-hidden="true" />
          {period && (
            <time className="experience-period" dateTime={item.createdAt}>
              {period}
            </time>
          )}
          <h3 className="experience-title">{item.title}</h3>
          {item.summary && <p className="experience-summary">{item.summary}</p>}
          <RichTextViewer content={item.body} className="text-sm text-text-muted" />
          {item.imageUrls.length > 0 && (
            <div className="experience-evidence">
              {item.imageUrls.slice(0, 4).map((url, index) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element -- URLs firmadas externas */}
                  <img src={url} alt={`Evidencia ${index + 1} de ${item.title}`} loading="lazy" />
                </a>
              ))}
            </div>
          )}
          {tags.length > 0 && (
            <ul className="capability-tags" aria-label="Stack utilizado">
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </li>
      );
    })}
  </ol>
);

export default ExperienceTimeline;
