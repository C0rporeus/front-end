import { useState } from "react";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolButton from "@/components/UI/ToolButton";
import ToolOutput from "@/components/UI/ToolOutput";
import { ToolSelect } from "@/components/UI/ToolInput";

type KeySize = 2048 | 4096;

function arrayBufferToPem(buffer: ArrayBuffer, label: string): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  const lines = base64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
}

const RsaKeysTool = () => {
  const [keySize, setKeySize] = useState<KeySize>(2048);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      const pubExported = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privExported = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      setPublicKey(arrayBufferToPem(pubExported, "PUBLIC KEY"));
      setPrivateKey(arrayBufferToPem(privExported, "PRIVATE KEY"));
    } catch {
      setError("Error generando las claves RSA. Verifica que tu navegador soporta Web Crypto API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1 className="public-title mb-2">Generador RSA</h1>
      <p className="public-lead mb-6">Generar pares de claves RSA publica/privada con Web Crypto API.</p>

      {error && <ErrorAlert message={error} />}

      <div className="public-card">
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm text-text-secondary">Tamano de clave:</label>
          <ToolSelect
            value={keySize}
            onChange={(e) => setKeySize(Number(e.target.value) as KeySize)}
          >
            <option value={2048}>2048 bits</option>
            <option value={4096}>4096 bits</option>
          </ToolSelect>
          <ToolButton
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generando..." : "Generar Par RSA"}
          </ToolButton>
        </div>

        {publicKey && (
          <div className="mb-4">
            <h3 className="mb-1 text-sm font-semibold text-text-secondary">Clave Publica (SPKI/PEM)</h3>
            <ToolOutput className="max-h-48 overflow-auto whitespace-pre-wrap break-all">
              {publicKey}
            </ToolOutput>
          </div>
        )}

        {privateKey && (
          <div>
            <h3 className="mb-1 text-sm font-semibold text-text-secondary">Clave Privada (PKCS8/PEM)</h3>
            <ToolOutput className="max-h-48 overflow-auto whitespace-pre-wrap break-all">
              {privateKey}
            </ToolOutput>
          </div>
        )}
      </div>
    </section>
  );
};

export default RsaKeysTool;
