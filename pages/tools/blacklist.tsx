import Head from "next/head";
import ToolsLayout from "@/components/tools/ToolsLayout";
import BlacklistCheckerTool from "@/components/tools/network/BlacklistCheckerTool";

export default function BlacklistPage() {
  return (
    <>
      <Head>
        <title>Blacklist Checker | Tools | Portfolio Dev</title>
        <meta name="description" content="Verificar si un dominio o IP esta en listas negras DNSBL" />
      </Head>
      <ToolsLayout>
        <BlacklistCheckerTool />
      </ToolsLayout>
    </>
  );
}
