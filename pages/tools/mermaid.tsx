import Head from "next/head";
import dynamic from "next/dynamic";
import ToolsLayout from "@/components/tools/ToolsLayout";

const MermaidTool = dynamic(
  () => import("@/components/tools/diagrams/MermaidTool"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-text-muted">Cargando editor Mermaid...</p>
      </div>
    ),
  }
);

export default function MermaidPage() {
  return (
    <>
      <Head>
        <title>Mermaid | Tools | Portfolio Dev</title>
        <meta name="description" content="Generar diagramas desde texto con sintaxis Mermaid" />
      </Head>
      <ToolsLayout>
        <MermaidTool />
      </ToolsLayout>
    </>
  );
}
