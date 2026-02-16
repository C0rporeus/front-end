import Head from "next/head";
import ToolsLayout from "@/components/tools/ToolsLayout";
import RsaKeysTool from "@/components/tools/encoding/RsaKeysTool";

export default function RsaKeysPage() {
  return (
    <>
      <Head>
        <title>Generador RSA | Tools | Portfolio Dev</title>
        <meta name="description" content="Generar pares de claves RSA publica/privada con Web Crypto API" />
      </Head>
      <ToolsLayout>
        <RsaKeysTool />
      </ToolsLayout>
    </>
  );
}
