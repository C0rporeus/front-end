import Head from "next/head";
import ToolsLayout from "@/components/tools/ToolsLayout";
import ToolsOverviewGrid from "@/components/tools/ToolsOverviewGrid";

export default function ToolsPage() {
  return (
    <>
      <Head>
        <title>Tools | Portfolio Dev</title>
        <meta name="description" content="Herramientas para equipos de desarrollo: codificacion, criptografia, red, DNS y diagramas" />
      </Head>
      <ToolsLayout>
        <section className="mb-8">
          <h1 className="public-title">Herramientas para equipos de desarrollo</h1>
          <p className="public-lead">
            Utilidades practicas para acelerar tareas comunes de desarrollo, redes y operaciones.
          </p>
        </section>
        <ToolsOverviewGrid />
      </ToolsLayout>
    </>
  );
}
