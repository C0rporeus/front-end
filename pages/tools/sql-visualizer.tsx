import dynamic from "next/dynamic";
import ToolPage from "@/components/tools/ToolPage";

const SqlVisualizerTool = dynamic(
  () => import("@/components/tools/diagrams/SqlVisualizerTool"),
  {
    ssr: false,
    loading: () => (
      <>
        {/* El título queda en el HTML estático; el editor trae el suyo al cargar. */}
        <h1 className="public-title mb-2">Visualizador SQL</h1>
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-text-muted">Cargando visualizador SQL...</p>
        </div>
      </>
    ),
  }
);

export default function SqlVisualizerPage() {
  return (
    <ToolPage slug="sql-visualizer">
      <SqlVisualizerTool />
    </ToolPage>
  );
}
