import Head from "next/head";
import ToolsLayout from "@/components/tools/ToolsLayout";
import Base64Tool from "@/components/tools/encoding/Base64Tool";

export default function Base64Page() {
  return (
    <>
      <Head>
        <title>Base64 | Tools | Portfolio Dev</title>
        <meta name="description" content="Codificar y decodificar texto en Base64" />
      </Head>
      <ToolsLayout>
        <Base64Tool />
      </ToolsLayout>
    </>
  );
}
