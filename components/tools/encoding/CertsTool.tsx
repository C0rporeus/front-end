import { useState } from "react";
import { generateSelfSignedCert } from "@/api/tools";
import { formatApiError } from "@/utils/format-api-error";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolButton from "@/components/UI/ToolButton";
import ToolOutput from "@/components/UI/ToolOutput";
import { ToolInput } from "@/components/UI/ToolInput";

const CertsTool = () => {
  const [commonName, setCommonName] = useState("localhost");
  const [organization, setOrganization] = useState("PortfolioTools");
  const [validDays, setValidDays] = useState(365);
  const [password, setPassword] = useState("changeit");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    try {
      const result = await generateSelfSignedCert({
        commonName,
        organization,
        validDays,
        password,
      });
      setOutput(
        [
          "=== CERT (PEM) ===",
          result.certPem,
          "=== KEY (PEM) ===",
          result.keyPem,
          "=== PFX (BASE64) ===",
          result.pfxBase64,
        ].join("\n")
      );
    } catch (err: unknown) {
      setError(formatApiError(err, "Error procesando la solicitud"));
    }
  };

  return (
    <section>
      <h1 className="public-title mb-2">Certificados Autofirmados</h1>
      <p className="public-lead mb-6">Generar certificados .cert/.pfx autofirmados.</p>

      {error && <ErrorAlert message={error} />}

      <div className="public-card">
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <ToolInput
            value={commonName}
            onChange={(e) => setCommonName(e.target.value)}
            placeholder="Common Name"
          />
          <ToolInput
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Organization"
          />
          <ToolInput
            type="number"
            value={validDays}
            onChange={(e) => setValidDays(Number(e.target.value))}
            placeholder="Dias de validez"
          />
          <ToolInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password PFX"
          />
        </div>
        <ToolButton className="mb-3" onClick={handleGenerate}>
          Generar Certificado
        </ToolButton>
        <ToolOutput className="max-h-80 overflow-auto whitespace-pre-wrap break-all">
          {output}
        </ToolOutput>
      </div>
    </section>
  );
};

export default CertsTool;
