import { useEffect, useRef } from "react";

import { createBoardScene, type BoardProjector, type BoardSceneHandle } from "@/components/board/board-scene";

type BoardCanvasProps = {
  activeStationId: string | null;
  onLayout: (project: BoardProjector) => void;
  onReady: () => void;
  onUnavailable: () => void;
};

/** Canvas WebGL del tablero. Es decorativo: la información vive en la lista de bloques. */
const BoardCanvas = ({ activeStationId, onLayout, onReady, onUnavailable }: BoardCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<BoardSceneHandle | null>(null);
  const callbacks = useRef({ onLayout, onReady, onUnavailable });

  useEffect(() => {
    callbacks.current = { onLayout, onReady, onUnavailable };
  }, [onLayout, onReady, onUnavailable]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let scene: BoardSceneHandle;
    try {
      scene = createBoardScene(canvas, {
        onLayout: (project) => callbacks.current.onLayout(project),
        onContextLost: () => callbacks.current.onUnavailable(),
      });
    } catch {
      callbacks.current.onUnavailable();
      return undefined;
    }
    sceneRef.current = scene;
    const ready = requestAnimationFrame(() => callbacks.current.onReady());
    return () => {
      cancelAnimationFrame(ready);
      sceneRef.current = null;
      scene.dispose();
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.setActiveStation(activeStationId);
  }, [activeStationId]);

  return <canvas ref={canvasRef} className="board-canvas" aria-hidden="true" />;
};

export default BoardCanvas;
