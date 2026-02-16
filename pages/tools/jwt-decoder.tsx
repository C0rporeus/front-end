import Head from "next/head";
import ToolsLayout from "@/components/tools/ToolsLayout";
import JwtDecoderTool from "@/components/tools/encoding/JwtDecoderTool";

export default function JwtDecoderPage() {
  return (
    <>
      <Head>
        <title>JWT Decoder | Tools | Portfolio Dev</title>
        <meta name="description" content="Decodificar y analizar tokens JWT: header, payload, claims y expiracion" />
      </Head>
      <ToolsLayout>
        <JwtDecoderTool />
      </ToolsLayout>
    </>
  );
}
