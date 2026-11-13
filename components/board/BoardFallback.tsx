import { useEffect, useRef } from "react";

import { BOARD_ROUTES, BOARD_STATIONS, BOARD_TAPS } from "@/components/board/board-config";
import type { BoardProjector } from "@/components/board/board-scene";
import { toSvgPath, upstreamRouteIds } from "@/utils/board-geometry";

/** Ventana del tablero que dibuja el SVG, en teselas. */
const VIEW = { x: -4, y: 2, width: 38, height: 18 };

type BoardFallbackProps = {
  activeStationId: string | null;
  /** Mismo contrato que la escena 3D: recoloca los rótulos del DOM sobre el dibujo. */
  onLayout: (project: BoardProjector) => void;
  hidden: boolean;
};

/**
 * El tablero en plano, sin WebGL. Es lo primero que se pinta y lo que queda cuando
 * no hay 3D (movimiento reducido, ahorro de datos o contexto no disponible).
 */
const BoardFallback = ({ activeStationId, onLayout, hidden }: BoardFallbackProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const lit = activeStationId ? upstreamRouteIds(BOARD_ROUTES, activeStationId) : null;

  useEffect(() => {
    const svg = svgRef.current;
    const stage = svg?.parentElement;
    if (!svg || !stage || hidden) return undefined;
    const layout = () => {
      const bounds = svg.getBoundingClientRect();
      const origin = stage.getBoundingClientRect();
      onLayout(([x, y]) => ({
        x: bounds.left - origin.left + ((x - VIEW.x) / VIEW.width) * bounds.width,
        y: bounds.top - origin.top + ((y - VIEW.y) / VIEW.height) * bounds.height,
      }));
    };
    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [hidden, onLayout]);

  return (
    <svg
      ref={svgRef}
      className={`board-fallback${hidden ? " is-hidden" : ""}${lit ? " has-focus" : ""}`}
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="board-tiles" x="0.5" y="0.5" width="1" height="1" patternUnits="userSpaceOnUse">
          <rect x="0.035" y="0.035" width="0.93" height="0.93" rx="0.06" className="board-fallback-tile" />
        </pattern>
      </defs>
      <rect x={VIEW.x} y={VIEW.y} width={VIEW.width} height={VIEW.height} fill="url(#board-tiles)" />
      {BOARD_ROUTES.map((route) => (
        <g key={route.id} className={`board-fallback-route${lit?.has(route.id) ? " is-lit" : ""}`}>
          <path d={toSvgPath(route.points)} className="board-fallback-line" />
          <path d={toSvgPath(route.points)} className="board-fallback-pulse" pathLength={100} />
        </g>
      ))}
      {BOARD_TAPS.map((tap) => (
        <circle key={tap.id} cx={tap.at[0]} cy={tap.at[1]} r="0.22" className="board-fallback-tap" />
      ))}
      {BOARD_STATIONS.map((station) => (
        <g key={station.id} className={station.id === activeStationId ? "is-active" : undefined}>
          <rect x={station.at[0] - 0.9} y={station.at[1] - 0.9} width="1.8" height="1.8" rx="0.12" className="board-fallback-plate" />
          <circle cx={station.at[0]} cy={station.at[1]} r="0.34" className="board-fallback-lamp" />
        </g>
      ))}
    </svg>
  );
};

export default BoardFallback;
