import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import BoardFallback from "@/components/board/BoardFallback";
import { BOARD_STATIONS, BOARD_TAPS, DEFAULT_READOUT } from "@/components/board/board-config";
import type { BoardProjector } from "@/components/board/board-scene";

// three.js solo se descarga en el navegador y después del primer pintado.
const BoardCanvas = dynamic(() => import("@/components/board/BoardCanvas"), { ssr: false });

/** Debe coincidir con PROJECTED_MIN_WIDTH de la escena y con BoardHero.css. */
const PROJECTED_QUERY = "(min-width: 1100px)";

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

/** Gestos que cuentan como primera interacción del visitante. */
const FIRST_INTERACTION_EVENTS = ["scroll", "pointerdown", "touchstart", "keydown"] as const;

/** WebGL disponible y el visitante no pidió menos movimiento ni ahorro de datos. */
function canRunScene(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if ((navigator as NavigatorWithConnection).connection?.saveData) return false;
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
  } catch {
    return false;
  }
}

const BoardHero = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [scene, setScene] = useState<"pending" | "loading" | "ready" | "unavailable">("pending");
  const labelsRef = useRef<HTMLDivElement | null>(null);
  const indexesRef = useRef<HTMLOListElement | null>(null);
  const readoutRef = useRef<HTMLParagraphElement | null>(null);
  const leaderRef = useRef<HTMLSpanElement | null>(null);
  const projectorRef = useRef<BoardProjector | null>(null);

  const activeId = hovered ?? pinned;
  const activeStation = BOARD_STATIONS.find((station) => station.id === activeId);

  useEffect(() => {
    if (!canRunScene()) {
      setScene("unavailable");
      return undefined;
    }
    // La escena (three.js y sus shaders) nunca compite con la carga inicial:
    // - a todo el ancho arranca cuando la página terminó de cargar y el hilo principal queda libre;
    // - en franja (móvil y tableta) el SVG cubre la carga y la escena arranca con el primer gesto.
    const wide = window.matchMedia(PROJECTED_QUERY);
    let idle = 0;
    let timer = 0;
    let scheduled = false;
    const whenIdle = () => {
      if (scheduled) return;
      scheduled = true;
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(() => setScene("loading"), { timeout: 2000 });
      } else {
        timer = window.setTimeout(() => setScene("loading"), 300);
      }
    };
    const afterLoad = () => {
      if (document.readyState === "complete") whenIdle();
      else window.addEventListener("load", whenIdle, { once: true });
    };
    const onWide = (event: MediaQueryListEvent) => {
      if (event.matches) afterLoad();
    };
    if (wide.matches) {
      afterLoad();
    } else {
      FIRST_INTERACTION_EVENTS.forEach((name) =>
        window.addEventListener(name, whenIdle, { once: true, passive: true }),
      );
      wide.addEventListener("change", onWide);
    }
    return () => {
      window.removeEventListener("load", whenIdle);
      FIRST_INTERACTION_EVENTS.forEach((name) => window.removeEventListener(name, whenIdle));
      wide.removeEventListener("change", onWide);
      if (idle) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, []);

  // La escena (o el SVG) dicta dónde cae cada bloque; los rótulos se mueven sin re-render.
  const placeLabels = useCallback((project: BoardProjector) => {
    const layer = labelsRef.current;
    if (!layer) return;
    const projected = window.matchMedia(PROJECTED_QUERY).matches;
    layer.querySelectorAll<HTMLElement>("[data-board-x]").forEach((element) => {
      if (!projected) {
        element.style.transform = "";
        return;
      }
      const { x, y } = project([Number(element.dataset.boardX), Number(element.dataset.boardY)]);
      element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
    layer.dataset.placed = projected ? "true" : "false";
  }, []);

  // En franja no hay rótulos proyectados: cada bloque lleva su número, que sigue al dibujo (SVG o 3D).
  const placeIndexes = useCallback((project: BoardProjector) => {
    indexesRef.current?.querySelectorAll<HTMLElement>("[data-board-x]").forEach((element) => {
      const { x, y } = project([Number(element.dataset.boardX), Number(element.dataset.boardY)]);
      element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
  }, []);

  // La lectura cuelga del bloque enfocado: se coloca debajo (o encima si no cabe) sin salirse del hero.
  const placeReadout = useCallback((stationId: string | null) => {
    const layer = labelsRef.current;
    const readout = readoutRef.current;
    const leader = leaderRef.current;
    const project = projectorRef.current;
    if (!layer || !readout || !leader) return;
    if (!window.matchMedia(PROJECTED_QUERY).matches) {
      readout.style.transform = "";
      leader.style.transform = "";
      leader.style.height = "";
      return;
    }
    // Sin bloque enfocado el panel se desvanece donde está, sin saltar.
    const station = BOARD_STATIONS.find((candidate) => candidate.id === stationId);
    if (!station || !project) return;
    const { x, y } = project(station.at);
    const panelWidth = readout.offsetWidth;
    const panelHeight = readout.offsetHeight;
    const lampRadius = 20;
    const gap = 26;
    const fitsBelow = y + lampRadius + gap + panelHeight <= layer.clientHeight - 12;
    const left = Math.min(Math.max(x - panelWidth / 2, 12), layer.clientWidth - panelWidth - 12);
    // Encima debe salvar además el rótulo del bloque.
    const top = fitsBelow ? y + lampRadius + gap : y - lampRadius - 34 - gap - panelHeight;
    const leaderTop = fitsBelow ? y + lampRadius : top + panelHeight;
    const leaderHeight = fitsBelow ? gap : y - lampRadius - 34 - leaderTop;
    readout.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
    leader.style.transform = `translate3d(${x.toFixed(1)}px, ${leaderTop.toFixed(1)}px, 0)`;
    leader.style.height = `${Math.max(leaderHeight, 0).toFixed(1)}px`;
  }, []);

  const activeIdRef = useRef<string | null>(null);
  const handleLayout = useCallback(
    (project: BoardProjector) => {
      projectorRef.current = project;
      placeLabels(project);
      placeIndexes(project);
      placeReadout(activeIdRef.current);
    },
    [placeIndexes, placeLabels, placeReadout],
  );

  useLayoutEffect(() => {
    activeIdRef.current = activeId;
    placeReadout(activeId);
  }, [activeId, placeReadout]);

  const sceneReady = scene === "ready";
  const markReady = useCallback(() => setScene("ready"), []);
  const markUnavailable = useCallback(() => setScene("unavailable"), []);

  return (
    <section className="board-hero" aria-labelledby="hero-title" data-scene={scene}>
      <div className="board-hero-stage">
        <BoardFallback activeStationId={activeId} onLayout={handleLayout} hidden={sceneReady} />
        {(scene === "loading" || sceneReady) && (
          <BoardCanvas
            activeStationId={activeId}
            onLayout={handleLayout}
            onReady={markReady}
            onUnavailable={markUnavailable}
          />
        )}
        <ol ref={indexesRef} className="board-indexes" aria-hidden="true">
          {BOARD_STATIONS.map((station, index) => (
            <li
              key={station.id}
              data-board-x={station.at[0]}
              data-board-y={station.at[1]}
              data-active={activeId === station.id}
            >
              <span>{index + 1}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="board-hero-copy">
        <h1 id="hero-title" className="board-hero-title">
          Diseño, construyo y opero sistemas de software.
        </h1>
        <p className="board-hero-lead">
          Soy Yonathan Gutierrez. Trabajo entre el código, la arquitectura distribuida y la operación, y he
          llevado ese recorrido a seis industrias. Aquí escribo lo que aprendo y dejo las herramientas que uso.
        </p>
        <div className="board-hero-actions">
          <a href="#seccion-blog" className="pushbutton pushbutton-primary">
            <span className="lamp" aria-hidden="true" />
            Leer artículos
          </a>
          <Link href="/portfolio" className="pushbutton">
            <span className="lamp" aria-hidden="true" />
            Ver proyectos
          </Link>
        </div>
      </div>

      <div ref={labelsRef} className="board-labels" data-placed="false">
        <h2 className="sr-only">Recorrido profesional</h2>
        <ol className="board-stations">
          {BOARD_STATIONS.map((station, index) => (
            <li key={station.id} data-board-x={station.at[0]} data-board-y={station.at[1]}>
              <button
                type="button"
                className="board-station"
                aria-pressed={pinned === station.id}
                data-active={activeId === station.id}
                onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(station.id)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(station.id)}
                onBlur={() => setHovered(null)}
                onClick={() => setPinned((current) => (current === station.id ? null : station.id))}
              >
                <span className="board-station-lamp" aria-hidden="true" />
                <span className="board-station-index" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="board-station-label">{station.label}</span>
                <span className="sr-only">: {station.detail}</span>
              </button>
            </li>
          ))}
        </ol>
        <ul className="board-taps" aria-hidden="true">
          {BOARD_TAPS.map((tap) => (
            <li key={tap.id} data-board-x={tap.at[0]} data-board-y={tap.at[1]} data-side={tap.side}>
              <span>{tap.label}</span>
            </li>
          ))}
        </ul>
        <span ref={leaderRef} className="board-readout-leader" aria-hidden="true" data-active={Boolean(activeStation)} />
        <p className="board-hint" aria-hidden="true" data-active={Boolean(activeStation)}>
          <span className="lamp" data-state="on" />
          {DEFAULT_READOUT}
        </p>
        <p ref={readoutRef} className="board-readout" aria-hidden="true" data-active={Boolean(activeStation)}>
          <span className="board-readout-tag">{activeStation ? activeStation.label : "Lectura"}</span>
          <span className="board-readout-text">{activeStation ? activeStation.detail : DEFAULT_READOUT}</span>
        </p>
      </div>
    </section>
  );
};

export default BoardHero;
