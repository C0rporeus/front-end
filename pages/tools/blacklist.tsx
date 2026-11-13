import ToolPage from "@/components/tools/ToolPage";
import BlacklistCheckerTool from "@/components/tools/network/BlacklistCheckerTool";

export default function BlacklistPage() {
  return (
    <ToolPage slug="blacklist">
      <BlacklistCheckerTool />
    </ToolPage>
  );
}
