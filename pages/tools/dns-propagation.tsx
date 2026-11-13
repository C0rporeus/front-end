import ToolPage from "@/components/tools/ToolPage";
import DnsPropagationTool from "@/components/tools/network/DnsPropagationTool";

export default function DnsPropagationPage() {
  return (
    <ToolPage slug="dns-propagation">
      <DnsPropagationTool />
    </ToolPage>
  );
}
