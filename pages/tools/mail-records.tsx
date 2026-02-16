import Head from "next/head";
import ToolsLayout from "@/components/tools/ToolsLayout";
import MailRecordsTool from "@/components/tools/network/MailRecordsTool";

export default function MailRecordsPage() {
  return (
    <>
      <Head>
        <title>Registros de Correo | Tools | Portfolio Dev</title>
        <meta name="description" content="Consultar MX, SPF, DKIM y DMARC de un dominio" />
      </Head>
      <ToolsLayout>
        <MailRecordsTool />
      </ToolsLayout>
    </>
  );
}
