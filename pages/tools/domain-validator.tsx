import Head from "next/head";
import ToolsLayout from "@/components/tools/ToolsLayout";
import DomainValidatorTool from "@/components/tools/network/DomainValidatorTool";

export default function DomainValidatorPage() {
  return (
    <>
      <Head>
        <title>Validador de Dominio | Tools | Portfolio Dev</title>
        <meta name="description" content="Verificar resolucion DNS de un dominio" />
      </Head>
      <ToolsLayout>
        <DomainValidatorTool />
      </ToolsLayout>
    </>
  );
}
