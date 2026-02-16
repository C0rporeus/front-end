import { useState } from "react";
import { resolveDomain } from "@/api/tools";
import { formatApiError } from "@/utils/format-api-error";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolButton from "@/components/UI/ToolButton";
import { ToolInput } from "@/components/UI/ToolInput";

type ResolveResult = {
  domain: string;
  ipv4: string[] | null;
  ipv6: string[] | null;
  resolved: boolean;
};

const DomainValidatorTool = () => {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<ResolveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResolve = async () => {
    if (!domain.trim()) return;
    setError("");
    setLoading(true);
    try {
      const data = await resolveDomain(domain.trim());
      setResult(data);
    } catch (err: unknown) {
      setError(formatApiError(err, "Error al resolver el dominio"));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1 className="public-title mb-2">Validador de Dominio</h1>
      <p className="public-lead mb-6">Verificar resolucion DNS de un dominio.</p>

      {error && <ErrorAlert message={error} />}

      <div className="public-card">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm text-text-secondary">Dominio</label>
            <ToolInput
              className="w-full"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="ejemplo.com"
              onKeyDown={(e) => e.key === "Enter" && handleResolve()}
            />
          </div>
          <ToolButton onClick={handleResolve} disabled={loading}>
            {loading ? "Consultando..." : "Resolver"}
          </ToolButton>
        </div>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-3 w-3 rounded-full ${result.resolved ? "bg-emerald-400" : "bg-rose-400"}`}
              />
              <span className="text-sm font-medium text-text-primary">
                {result.resolved ? "Dominio resuelto correctamente" : "No se pudo resolver el dominio"}
              </span>
            </div>

            {(result.ipv4?.length ?? 0) > 0 && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-text-secondary">IPv4</h3>
                <ul className="space-y-0.5">
                  {result.ipv4?.map((ip) => (
                    <li key={ip} className="font-mono text-sm text-text-primary">{ip}</li>
                  ))}
                </ul>
              </div>
            )}

            {(result.ipv6?.length ?? 0) > 0 && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-text-secondary">IPv6</h3>
                <ul className="space-y-0.5">
                  {result.ipv6?.map((ip) => (
                    <li key={ip} className="font-mono text-sm text-text-primary">{ip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default DomainValidatorTool;
