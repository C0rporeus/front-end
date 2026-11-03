import { useState } from "react";
import { encodeBase64, decodeBase64, type Base64Variant } from "@/api/tools";
import { base64ToHex, hexToBase64 } from "@/utils/base64-hex";
import { formatApiError } from "@/utils/format-api-error";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolButton from "@/components/UI/ToolButton";
import ToolOutput from "@/components/UI/ToolOutput";
import { ToolSelect, ToolTextarea } from "@/components/UI/ToolInput";

const Base64Tool = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [variant, setVariant] = useState<Base64Variant>("std");

  const handleEncode = async () => {
    setError("");
    try {
      const result = await encodeBase64(input, variant);
      setOutput(result.encoded);
    } catch (err: unknown) {
      setError(formatApiError(err, "Error procesando la solicitud"));
    }
  };

  const handleDecode = async () => {
    setError("");
    try {
      const result = await decodeBase64(input, variant);
      setOutput(result.decoded);
    } catch (err: unknown) {
      setError(formatApiError(err, "Error procesando la solicitud"));
    }
  };

  // Conversión local: el contenido no se envía al servidor.
  const handleLocalConversion = (convert: () => string) => {
    setError("");
    try {
      setOutput(convert());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo convertir el valor");
    }
  };

  return (
    <section>
      <h1 className="public-title mb-2">Conversor Base64</h1>
      <p className="public-lead mb-6">Codificar y decodificar texto en Base64 (estándar o url-safe) y convertir entre Base64 y hexadecimal.</p>

      {error && <ErrorAlert message={error} />}

      <div className="public-card">
        <ToolTextarea
          className="mb-3 w-full"
          rows={4}
          placeholder="Texto o base64"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label htmlFor="base64-variant" className="text-sm text-text-secondary">Variante</label>
          <ToolSelect id="base64-variant" value={variant} onChange={(e) => setVariant(e.target.value as Base64Variant)}>
            <option value="std">Estándar (RFC 4648 §4)</option>
            <option value="url">URL-safe sin relleno (JWT)</option>
          </ToolSelect>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          <ToolButton onClick={handleEncode}>
            Codificar
          </ToolButton>
          <ToolButton variant="secondary" onClick={handleDecode}>
            Decodificar
          </ToolButton>
          <ToolButton variant="secondary" onClick={() => handleLocalConversion(() => base64ToHex(input))}>
            Base64 → Hex
          </ToolButton>
          <ToolButton variant="secondary" onClick={() => handleLocalConversion(() => hexToBase64(input, variant))}>
            Hex → Base64
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
