import ToolPage from "@/components/tools/ToolPage";
import RsaKeysTool from "@/components/tools/encoding/RsaKeysTool";

export default function RsaKeysPage() {
  return (
    <ToolPage slug="rsa-keys">
      <RsaKeysTool />
    </ToolPage>
  );
}
