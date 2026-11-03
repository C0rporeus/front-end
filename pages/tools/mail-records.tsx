import Head from "next/head";
import ToolsLayout from "@/components/tools/ToolsLayout";
import MailAuditTool from "@/components/tools/network/MailAuditTool";

export default function MailAuditPage() {
  return (
    <>
      <Head>
        <title>Auditor de correo SPF, DKIM y DMARC | Tools | Portfolio Dev</title>
        <meta
          name="description"
          content="Audita SPF (lookups), DKIM, DMARC, MX, MTA-STS y TLS-RPT de un dominio con hallazgos y cómo corregirlos"
        />
      </Head>
      <ToolsLayout>
        <MailAuditTool />
      </ToolsLayout>
    </>
  );
}
