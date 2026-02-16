import Head from "next/head";
import ToolsLayout from "@/components/tools/ToolsLayout";
import DnsPropagationTool from "@/components/tools/network/DnsPropagationTool";

export default function DnsPropagationPage() {
  return (
    <>
      <Head>
        <title>Propagacion DNS | Tools | Portfolio Dev</title>
        <meta name="description" content="Consultar registros DNS desde el servidor" />
      </Head>
      <ToolsLayout>
        <DnsPropagationTool />
      </ToolsLayout>
    </>
  );
}
