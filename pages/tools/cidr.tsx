import ToolPage from "@/components/tools/ToolPage";
import CidrCalculatorTool from "@/components/tools/network/CidrCalculatorTool";

export default function CidrPage() {
  return (
    <ToolPage slug="cidr">
      <CidrCalculatorTool />
    </ToolPage>
  );
}
