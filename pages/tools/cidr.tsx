import Head from "next/head";
import ToolsLayout from "@/components/tools/ToolsLayout";
import CidrCalculatorTool from "@/components/tools/network/CidrCalculatorTool";

export default function CidrPage() {
  return (
    <>
      <Head>
        <title>Calculadora CIDR | Tools | Portfolio Dev</title>
        <meta name="description" content="Calcular rangos de red, subredes y segmentos IP" />
      </Head>
      <ToolsLayout>
        <CidrCalculatorTool />
      </ToolsLayout>
    </>
  );
}
