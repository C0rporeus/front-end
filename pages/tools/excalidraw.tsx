import dynamic from "next/dynamic";
import ToolPage from "@/components/tools/ToolPage";

const ExcalidrawTool = dynamic(
  () => import("@/components/tools/diagrams/ExcalidrawTool"),
  {
    ssr: false,
    loading: () => (
      <>
        {/* El título queda en el HTML estático; el editor trae el suyo al cargar. */}
        <h1 className="public-title mb-2">Excalidraw</h1>
        <div className="flex min-h-[500px] items-center justify-center">
          <p className="text-text-muted">Cargando editor Excalidraw...</p>
        </div>
      </>
    ),
  }
);

export default function ExcalidrawPage() {
  return (
    <ToolPage slug="excalidraw">
      <ExcalidrawTool />
    </ToolPage>
  );
}
