import ToolPage from "@/components/tools/ToolPage";
import MailAuditTool from "@/components/tools/network/MailAuditTool";

export default function MailAuditPage() {
  return (
    <ToolPage slug="mail-records">
      <MailAuditTool />
    </ToolPage>
  );
}
