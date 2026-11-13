import PageSeo from "@/components/seo/PageSeo";
import ToolsLayout from "@/components/tools/ToolsLayout";
import ToolsOverviewGrid from "@/components/tools/ToolsOverviewGrid";

export default function ToolsPage() {
  return (
    <>
      <PageSeo
        title="Herramientas online para desarrollo, redes y DNS | Yonathan Gutierrez"
        description="Herramientas gratuitas para equipos de desarrollo: Base64, UUID, JWT, claves RSA, certificados autofirmados, auditoría SPF/DKIM/DMARC, DNS, CIDR y diagramas."
        path="/tools/"
      />
      <ToolsLayout>
        <section className="mb-8">
          <h1 className="public-title">Herramientas para equipos de desarrollo</h1>
          <p className="public-lead">
            Utilidades prácticas para acelerar tareas comunes de desarrollo, redes y operaciones.
          </p>
        </section>
        <ToolsOverviewGrid />
      </ToolsLayout>
    </>
  );
}
