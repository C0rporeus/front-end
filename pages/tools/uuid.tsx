import Head from "next/head";
import ToolsLayout from "@/components/tools/ToolsLayout";
import UuidTool from "@/components/tools/encoding/UuidTool";

export default function UuidPage() {
  return (
    <>
      <Head>
        <title>UUID v4 | Tools | Portfolio Dev</title>
        <meta name="description" content="Generar identificadores unicos universales UUID v4" />
      </Head>
      <ToolsLayout>
        <UuidTool />
      </ToolsLayout>
    </>
  );
}
