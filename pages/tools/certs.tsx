import Head from "next/head";
import ToolsLayout from "@/components/tools/ToolsLayout";
import CertsTool from "@/components/tools/encoding/CertsTool";

export default function CertsPage() {
  return (
    <>
      <Head>
        <title>Certificados Autofirmados | Tools | Portfolio Dev</title>
        <meta name="description" content="Generar certificados .cert/.pfx autofirmados" />
      </Head>
      <ToolsLayout>
        <CertsTool />
      </ToolsLayout>
    </>
  );
}
