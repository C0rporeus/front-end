import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

const ExcalidrawTool = () => {
  return (
    <section>
      <h1 className="public-title mb-2">Excalidraw</h1>
      <p className="public-lead mb-6">Editor de diagramas estilo pizarra.</p>

      <div className="overflow-hidden rounded-2xl border border-slate-700/80">
        <div style={{ height: "calc(100vh - 240px)", minHeight: "500px" }}>
          <Excalidraw
            theme="dark"
            langCode="es-ES"
            UIOptions={{
              canvasActions: {
                loadScene: false,
                export: { saveFileToDisk: true },
              },
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default ExcalidrawTool;
