import Head from "next/head";
import dynamic from "next/dynamic";
import ToolsLayout from "@/components/tools/ToolsLayout";

const SqlVisualizerTool = dynamic(
  () => import("@/components/tools/diagrams/SqlVisualizerTool"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-text-muted">Cargando visualizador SQL...</p>
      </div>
    ),
  }
);

export default function SqlVisualizerPage() {
  return (
    <>
      <Head>
        <title>Visualizador SQL | Tools | Portfolio Dev</title>
        <meta name="description" content="Visualizar tablas y relaciones a partir de sentencias CREATE TABLE" />
      </Head>
      <ToolsLayout>
        <SqlVisualizerTool />
      </ToolsLayout>
    </>
  );
}
