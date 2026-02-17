import { useState } from "react";
import { encodeBase64, decodeBase64 } from "@/api/tools";
import { formatApiError } from "@/utils/format-api-error";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolButton from "@/components/UI/ToolButton";
import ToolOutput from "@/components/UI/ToolOutput";
import { ToolTextarea } from "@/components/UI/ToolInput";

const Base64Tool = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleEncode = async () => {
    setError("");
    try {
      const result = await encodeBase64(input);
      setOutput(result.encoded);
    } catch (err: unknown) {
      setError(formatApiError(err, "Error procesando la solicitud"));
    }
  };

  const handleDecode = async () => {
    setError("");
    try {
      const result = await decodeBase64(input);
      setOutput(result.decoded);
    } catch (err: unknown) {
      setError(formatApiError(err, "Error procesando la solicitud"));
    }
  };

  return (
    <section>
      <h1 className="public-title mb-2">Conversor Base64</h1>
      <p className="public-lead mb-6">Codificar y decodificar texto en Base64.</p>

      {error && <ErrorAlert message={error} />}

      <div className="public-card">
        <ToolTextarea
          className="mb-3 w-full"
          rows={4}
          placeholder="Texto o base64"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="mb-3 flex flex-wrap gap-2">
          <ToolButton onClick={handleEncode}>
            Codificar
          </ToolButton>
          <ToolButton variant="secondary" onClick={handleDecode}>
            Decodificar
          </ToolButton>
        </div>
        <ToolOutput className="whitespace-pre-wrap break-all">
          {output}
        </ToolOutput>
      </div>
    </section>
  );
};

export default Base64Tool;
