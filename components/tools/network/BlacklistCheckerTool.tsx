import { useState } from "react";
import { checkBlacklist, resolveDomain, type BlacklistEntry, type BlacklistResponse } from "@/api/tools";
import { formatApiError } from "@/utils/format-api-error";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolButton from "@/components/UI/ToolButton";
import { ToolInput } from "@/components/UI/ToolInput";

type BlacklistResult = BlacklistResponse;

const ERROR_LABELS: Record<string, string> = {
  timeout: "Sin respuesta (timeout)",
  servfail: "Error del servidor DNS",
  query_blocked: "La lista bloqueó la consulta",
  unexpected_response: "Respuesta inesperada",
  error: "No se pudo consultar",
};

/** Resume el resultado sin tratar nunca un error de consulta como "limpio". */
const summarize = (results: BlacklistEntry[]) => {
  const listed = results.filter((r) => r.status === "listed").length;
  const failed = results.filter((r) => r.status === "error").length;
  const checked = results.length - failed;
  if (listed > 0) return { tone: "bad" as const, text: `IP listada en ${listed} de ${checked} listas consultadas` };
  if (checked === 0) return { tone: "warn" as const, text: "No se pudo consultar ninguna lista: no hay veredicto" };
  if (failed > 0) {
    return {
      tone: "warn" as const,
      text: `Sin coincidencias en ${checked} listas, pero ${failed} no pudieron consultarse: resultado incompleto`,
    };
  }
  return { tone: "ok" as const, text: `IP limpia — no aparece en ninguna de las ${checked} listas` };
};

const TONE_DOT = { ok: "bg-emerald-400", warn: "bg-amber-400", bad: "bg-rose-400" } as const;

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

  const summary = result ? summarize(result.results) : null;

  return (
    <section>
      <h1 className="public-title mb-2">Blacklist Checker</h1>
      <p className="public-lead mb-6">Verifica una IPv4 (o la IPv4 de un dominio) en listas negras DNSBL. Una lista que no responde se indica aparte y nunca cuenta como limpia.</p>

      {error && <ErrorAlert message={error} />}

      <div className="public-card">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm text-text-secondary">Dirección IPv4 o dominio</label>
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
            {summary && (
              <div className="mb-3 flex items-center gap-2" role="status">
                <span className={`inline-block h-3 w-3 rounded-full ${TONE_DOT[summary.tone]}`} />
                <span className="text-sm font-medium text-text-primary">{summary.text}</span>
              </div>
            )}

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
                        {entry.status === "listed" && (
                          <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-300">
                            Listada
                          </span>
                        )}
                        {entry.status === "not_listed" && (
                          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                            Limpia
                          </span>
                        )}
                        {entry.status === "error" && (
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                            {ERROR_LABELS[entry.error ?? "error"] ?? ERROR_LABELS.error}
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
