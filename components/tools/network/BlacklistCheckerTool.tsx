import { useState } from "react";
import { checkBlacklist, resolveDomain } from "@/api/tools";
import { formatApiError } from "@/utils/format-api-error";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolButton from "@/components/UI/ToolButton";
import { ToolInput } from "@/components/UI/ToolInput";

type BlacklistResult = {
  ip: string;
  results: Array<{ provider: string; listed: boolean }>;
};

const IPV4_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

const BlacklistCheckerTool = () => {
  const [input, setInput] = useState("");
  const [resolvedIp, setResolvedIp] = useState<string | null>(null);
  const [result, setResult] = useState<BlacklistResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resolveInput = async (value: string): Promise<string> => {
    if (IPV4_REGEX.test(value)) return value;

    const dns = await resolveDomain(value);
    if (!dns.ipv4 || dns.ipv4.length === 0) {
      throw new Error(`No se encontraron registros IPv4 para "${value}"`);
    }
    return dns.ipv4[0];
  };

  const handleCheck = async () => {
    if (!input.trim()) return;
    setError("");
    setResolvedIp(null);
    setLoading(true);
    try {
      const ip = await resolveInput(input.trim());
      setResolvedIp(IPV4_REGEX.test(input.trim()) ? null : ip);
      const data = await checkBlacklist(ip);
      setResult(data);
    } catch (err: unknown) {
      setError(formatApiError(err, "Error al consultar las listas negras", { bypassSafeMessage: true }));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const listedCount = result?.results.filter((r) => r.listed).length ?? 0;

  return (
    <section>
      <h1 className="public-title mb-2">Blacklist Checker</h1>
      <p className="public-lead mb-6">Verificar si una IP o dominio esta en listas negras DNSBL.</p>

      {error && <ErrorAlert message={error} />}

      <div className="public-card">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm text-text-secondary">Direccion IPv4 o dominio</label>
            <ToolInput
              className="w-full"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="8.8.8.8 o ejemplo.com"
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            />
          </div>
          <ToolButton onClick={handleCheck} disabled={loading}>
            {loading ? "Consultando..." : "Verificar"}
          </ToolButton>
        </div>

        {result && (
          <div>
            {resolvedIp && (
              <p className="mb-3 text-xs text-text-muted">
                Dominio resuelto a <span className="font-mono text-text-secondary">{resolvedIp}</span>
              </p>
            )}
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`inline-block h-3 w-3 rounded-full ${listedCount === 0 ? "bg-emerald-400" : "bg-rose-400"}`}
              />
              <span className="text-sm font-medium text-text-primary">
                {listedCount === 0
                  ? "IP limpia — no aparece en ninguna lista"
                  : `IP listada en ${listedCount} de ${result.results.length} proveedores`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 text-left text-text-muted">
                    <th className="pb-2 pr-4">Proveedor</th>
                    <th className="pb-2">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {result.results.map((entry) => (
                    <tr key={entry.provider}>
                      <td className="py-1.5 pr-4 font-mono text-text-secondary">{entry.provider}</td>
                      <td className="py-1.5">
                        {entry.listed ? (
                          <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-300">
                            Listada
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                            Limpia
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlacklistCheckerTool;
