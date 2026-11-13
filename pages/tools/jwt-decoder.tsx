import ToolPage from "@/components/tools/ToolPage";
import JwtDecoderTool from "@/components/tools/encoding/JwtDecoderTool";

export default function JwtDecoderPage() {
  return (
    <ToolPage slug="jwt-decoder">
      <JwtDecoderTool />
    </ToolPage>
  );
}
