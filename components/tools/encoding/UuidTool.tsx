import { useState } from "react";
import { generateUUIDv4 } from "@/api/tools";
import { formatApiError } from "@/utils/format-api-error";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolButton from "@/components/UI/ToolButton";
import ToolOutput from "@/components/UI/ToolOutput";

const UuidTool = () => {
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    try {
      const result = await generateUUIDv4();
      setOutput(result.uuid);
    } catch (err: unknown) {
      setError(formatApiError(err, "Error procesando la solicitud"));
    }
  };

  return (
    <section>
      <h1 className="public-title mb-2">Generador UUID v4</h1>
      <p className="public-lead mb-6">Generar identificadores unicos universales.</p>

      {error && <ErrorAlert message={error} />}

      <div className="public-card">
        <ToolButton className="mb-3" onClick={handleGenerate}>
          Generar UUIDv4
        </ToolButton>
        <ToolOutput>
          {output}
        </ToolOutput>
      </div>
    </section>
  );
};

export default UuidTool;
