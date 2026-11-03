import { useState } from "react";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolButton from "@/components/UI/ToolButton";
import ToolOutput from "@/components/UI/ToolOutput";
import { ToolInput } from "@/components/UI/ToolInput";
import { downloadBlob } from "@/utils/download";
import {
  CERT_LIMITS,
  generateSelfSignedCertificate,
  parseAltNames,
  type SelfSignedCertResult,
} from "@/utils/self-signed-cert";

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const CertsTool = () => {
  const [commonName, setCommonName] = useState("localhost");
  const [organization, setOrganization] = useState("");
  const [validDays, setValidDays] = useState(365);
  const [altNames, setAltNames] = useState("localhost, 127.0.0.1");
  const [withPfx, setWithPfx] = useState(false);
  const [pfxPassword, setPfxPassword] = useState("");
  const [result, setResult] = useState<SelfSignedCertResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setResult(null);
    if (withPfx && !pfxPassword) {
      setError("Indica una contraseña para el archivo .pfx");
      return;
    }
    setGenerating(true);
    try {
      setResult(
        await generateSelfSignedCertificate({
          commonName,
          organization,
          validDays,
          altNames: parseAltNames(altNames),
          pfxPassword: withPfx ? pfxPassword : undefined,
        }),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo generar el certificado");
    } finally {
      setGenerating(false);
    }
  };

  // Borra del estado la clave, el certificado y la contraseña: no queda nada en memoria de la app.
  const handleClear = () => {
    setResult(null);
    setPfxPassword("");
    setError("");
  };

  return (
    <section>
      <h1 className="public-title mb-2">Certificados Autofirmados</h1>
      <p className="public-lead mb-6">
        Genera un certificado X.509 con SAN para desarrollo y pruebas (HTTPS local, mTLS, contenedores).
      </p>

      <div
        className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-100"
        role="note"
        aria-label="Privacidad"
      >
        <p className="font-semibold">Se genera en tu navegador. Nada sale de tu equipo.</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-emerald-100/90">
          <li>La clave privada se crea localmente con WebCrypto y no se envía al servidor.</li>
          <li>No se guarda nada: ni localStorage, ni cookies, ni registros. Al recargar o pulsar «Limpiar» desaparece.</li>
          <li>Solo para desarrollo y pruebas: un certificado autofirmado no es de confianza pública.</li>
        </ul>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="public-card">
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-text-secondary">
            Common Name
            <ToolInput
              className="mt-1 w-full"
              value={commonName}
              onChange={(e) => setCommonName(e.target.value)}
              maxLength={CERT_LIMITS.maxNameLength}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <label className="block text-sm text-text-secondary">
            Organización (opcional)
            <ToolInput
              className="mt-1 w-full"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              maxLength={CERT_LIMITS.maxFieldLength}
              autoComplete="off"
            />
          </label>
          <label className="block text-sm text-text-secondary sm:col-span-2">
            Nombres alternativos (SAN): dominios, comodines o IPv4, separados por coma
            <ToolInput
              className="mt-1 w-full font-mono"
              value={altNames}
              onChange={(e) => setAltNames(e.target.value)}
              placeholder="localhost, 127.0.0.1, *.dev.local"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <label className="block text-sm text-text-secondary">
            Días de validez
            <ToolInput
              className="mt-1 w-full"
              type="number"
              min={CERT_LIMITS.minDays}
              max={CERT_LIMITS.maxDays}
              value={validDays}
              onChange={(e) => setValidDays(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="mb-4 space-y-2">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" checked={withPfx} onChange={(e) => setWithPfx(e.target.checked)} />
            Generar también un archivo .pfx (PKCS#12)
          </label>
          {withPfx && (
            <label className="block text-sm text-text-secondary">
              Contraseña del .pfx
              <ToolInput
                className="mt-1 w-full sm:w-72"
                type="password"
                value={pfxPassword}
                onChange={(e) => setPfxPassword(e.target.value)}
                maxLength={CERT_LIMITS.maxPasswordLength}
                autoComplete="new-password"
              />
            </label>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <ToolButton onClick={handleGenerate} disabled={generating}>
            {generating ? "Generando..." : "Generar certificado"}
          </ToolButton>
          {result && (
            <ToolButton variant="secondary" onClick={handleClear}>
              Limpiar
            </ToolButton>
          )}
        </div>

        {result && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary" role="status">
              Válido del {formatDate(result.notBefore)} al {formatDate(result.notAfter)} · SAN:{" "}
              <span className="font-mono">{result.altNames.join(", ")}</span>
            </p>

            <div>
              <h2 className="mb-1 text-sm font-semibold text-text-primary">Certificado (PEM)</h2>
              <ToolOutput className="max-h-48 overflow-auto whitespace-pre-wrap break-all text-xs">
                {result.certPem}
              </ToolOutput>
            </div>
            <div>
              <h2 className="mb-1 text-sm font-semibold text-text-primary">Clave privada (PEM, PKCS#8)</h2>
              <ToolOutput className="max-h-48 overflow-auto whitespace-pre-wrap break-all text-xs">
                {result.keyPem}
              </ToolOutput>
            </div>

            <div className="flex flex-wrap gap-2">
              <ToolButton variant="secondary" onClick={() => downloadBlob("certificate.crt", result.certPem, "application/x-pem-file")}>
                Descargar .crt
              </ToolButton>
              <ToolButton variant="secondary" onClick={() => downloadBlob("private.key", result.keyPem, "application/x-pem-file")}>
                Descargar .key
              </ToolButton>
              {result.pfx && (
                <ToolButton
                  variant="secondary"
                  onClick={() => downloadBlob("certificate.pfx", result.pfx as BlobPart, "application/x-pkcs12")}
                >
                  Descargar .pfx
                </ToolButton>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CertsTool;
