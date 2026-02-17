import { useState, useCallback } from "react";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolButton from "@/components/UI/ToolButton";
import ToolOutput from "@/components/UI/ToolOutput";
import { ToolTextarea } from "@/components/UI/ToolInput";

type JwtParts = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
};

type ClaimMeta = {
  label: string;
  format: (value: unknown) => string;
};

const KNOWN_CLAIMS: Record<string, ClaimMeta> = {
  iss: { label: "Issuer", format: String },
  sub: { label: "Subject", format: String },
  aud: { label: "Audience", format: String },
  exp: { label: "Expiration", format: formatTimestamp },
  nbf: { label: "Not Before", format: formatTimestamp },
  iat: { label: "Issued At", format: formatTimestamp },
  jti: { label: "JWT ID", format: String },
};

function formatTimestamp(value: unknown): string {
  if (typeof value !== "number") return String(value);
  const date = new Date(value * 1000);
  return `${date.toLocaleString()} (${value})`;
}

function decodeBase64Url(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + padding);
}

function parseJwt(token: string): JwtParts {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("El token debe tener exactamente 3 segmentos separados por puntos (header.payload.signature)");
  }

  const headerJson = decodeBase64Url(parts[0]);
  const payloadJson = decodeBase64Url(parts[1]);

  const header = JSON.parse(headerJson) as Record<string, unknown>;
  const payload = JSON.parse(payloadJson) as Record<string, unknown>;

  return { header, payload, signature: parts[2] };
}

function isExpired(payload: Record<string, unknown>): boolean | null {
  if (typeof payload.exp !== "number") return null;
  return Date.now() > payload.exp * 1000;
}

function timeUntilExpiry(payload: Record<string, unknown>): string | null {
  if (typeof payload.exp !== "number") return null;
  const diff = payload.exp * 1000 - Date.now();
  if (diff <= 0) {
    const ago = Math.abs(diff);
    if (ago < 60_000) return `Expirado hace ${Math.floor(ago / 1000)}s`;
    if (ago < 3_600_000) return `Expirado hace ${Math.floor(ago / 60_000)}min`;
    if (ago < 86_400_000) return `Expirado hace ${Math.floor(ago / 3_600_000)}h`;
    return `Expirado hace ${Math.floor(ago / 86_400_000)}d`;
  }
  if (diff < 60_000) return `Expira en ${Math.floor(diff / 1000)}s`;
  if (diff < 3_600_000) return `Expira en ${Math.floor(diff / 60_000)}min`;
  if (diff < 86_400_000) return `Expira en ${Math.floor(diff / 3_600_000)}h`;
  return `Expira en ${Math.floor(diff / 86_400_000)}d`;
}

const JwtDecoderTool = () => {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<JwtParts | null>(null);
  const [error, setError] = useState("");

  const handleDecode = useCallback(() => {
    if (!token.trim()) return;
    setError("");
    try {
      const result = parseJwt(token);
      setDecoded(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Token JWT invalido");
      setDecoded(null);
    }
  }, [token]);

  const handlePaste = useCallback(() => {
    navigator.clipboard.readText().then((text) => {
      setToken(text);
      if (text.trim()) {
        try {
          setDecoded(parseJwt(text));
          setError("");
        } catch {
          setError("El contenido pegado no es un JWT valido");
          setDecoded(null);
        }
      }
    }).catch(() => {
      setError("No se pudo acceder al portapapeles");
    });
  }, []);

  const expired = decoded ? isExpired(decoded.payload) : null;
  const expiryLabel = decoded ? timeUntilExpiry(decoded.payload) : null;

  return (
    <section>
      <h1 className="public-title mb-2">JWT Decoder</h1>
      <p className="public-lead mb-6">Decodificar y analizar tokens JWT — header, payload y claims.</p>

      {error && <ErrorAlert message={error} />}

      <div className="public-card">
        <label className="mb-1 block text-sm text-text-secondary">Token JWT</label>
        <ToolTextarea
          className="mb-3 w-full font-mono text-sm"
          rows={4}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleDecode();
          }}
        />
        <div className="mb-4 flex flex-wrap gap-2">
          <ToolButton onClick={handleDecode}>
            Decodificar
          </ToolButton>
          <ToolButton variant="secondary" onClick={handlePaste}>
            Pegar desde portapapeles
          </ToolButton>
        </div>
      </div>

      {decoded && (
        <div className="mt-6 space-y-5">
          {/* Expiration badge */}
          {expired !== null && (
            <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
              expired
                ? "border-rose-500/60 bg-rose-500/15 text-rose-300"
                : "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
            }`}>
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${expired ? "bg-rose-400" : "bg-emerald-400"}`} />
              {expiryLabel}
            </div>
          )}

          {/* Header */}
          <div className="public-card">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-text-muted">Header</h2>
            <div className="space-y-1.5">
              {Object.entries(decoded.header).map(([key, value]) => (
                <div key={key} className="flex items-baseline gap-2">
                  <span className="min-w-[80px] text-xs font-medium text-text-muted">{key}</span>
                  <span className="font-mono text-sm text-text-primary">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payload — known claims */}
          <div className="public-card">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-text-muted">Payload — Claims registrados</h2>
            <div className="space-y-1.5">
              {Object.entries(decoded.payload)
                .filter(([key]) => key in KNOWN_CLAIMS)
                .map(([key, value]) => {
                  const meta = KNOWN_CLAIMS[key];
                  return (
                    <div key={key} className="flex items-baseline gap-2">
                      <span className="min-w-[100px] text-xs font-medium text-text-muted">{meta.label} ({key})</span>
                      <span className="font-mono text-sm text-text-primary">{meta.format(value)}</span>
                    </div>
                  );
                })}
              {Object.keys(decoded.payload).filter((k) => k in KNOWN_CLAIMS).length === 0 && (
                <p className="text-sm text-text-muted">Sin claims registrados</p>
              )}
            </div>
          </div>

          {/* Payload — custom claims */}
          {Object.keys(decoded.payload).filter((k) => !(k in KNOWN_CLAIMS)).length > 0 && (
            <div className="public-card">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-text-muted">Payload — Claims personalizados</h2>
              <div className="space-y-1.5">
                {Object.entries(decoded.payload)
                  .filter(([key]) => !(key in KNOWN_CLAIMS))
                  .map(([key, value]) => (
                    <div key={key} className="flex items-baseline gap-2">
                      <span className="min-w-[100px] text-xs font-medium text-text-muted">{key}</span>
                      <span className="font-mono text-sm text-text-primary">
                        {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Raw JSON */}
          <div className="public-card">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-text-muted">JSON completo</h2>
            <ToolOutput className="whitespace-pre-wrap break-all font-mono text-sm">
{JSON.stringify({ header: decoded.header, payload: decoded.payload }, null, 2)}
            </ToolOutput>
          </div>

          {/* Signature */}
          <div className="public-card">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-text-muted">Signature</h2>
            <p className="mb-2 text-xs text-text-muted">
              La firma no se puede verificar sin la clave secreta. Se muestra el segmento raw en base64url.
            </p>
            <ToolOutput className="whitespace-pre-wrap break-all font-mono text-sm">
              {decoded.signature}
            </ToolOutput>
          </div>
        </div>
      )}
    </section>
  );
};

export default JwtDecoderTool;
