import dynamic from "next/dynamic";
import ToolPage from "@/components/tools/ToolPage";

const MermaidTool = dynamic(
  () => import("@/components/tools/diagrams/MermaidTool"),
  {
    ssr: false,
    loading: () => (
      <>
        {/* El título queda en el HTML estático; el editor trae el suyo al cargar. */}
        <h1 className="public-title mb-2">Mermaid</h1>
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-text-muted">Cargando editor Mermaid...</p>
        </div>
      </>
    ),
  }
);

export default function MermaidPage() {
  return (
    <ToolPage slug="mermaid">
      <MermaidTool />
    </ToolPage>
  );
}
