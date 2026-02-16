import Head from "next/head";
import dynamic from "next/dynamic";
import ToolsLayout from "@/components/tools/ToolsLayout";

const ExcalidrawTool = dynamic(
  () => import("@/components/tools/diagrams/ExcalidrawTool"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-text-muted">Cargando editor Excalidraw...</p>
      </div>
    ),
  }
);

export default function ExcalidrawPage() {
  return (
    <>
      <Head>
        <title>Excalidraw | Tools | Portfolio Dev</title>
        <meta name="description" content="Editor de diagramas estilo pizarra colaborativa" />
      </Head>
      <ToolsLayout>
        <ExcalidrawTool />
      </ToolsLayout>
    </>
  );
}
