import { useState } from "react";
import { checkDnsPropagation } from "@/api/tools";
import { formatApiError } from "@/utils/format-api-error";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolButton from "@/components/UI/ToolButton";
import { ToolInput, ToolSelect } from "@/components/UI/ToolInput";

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT"] as const;

type PropagationResult = {
  domain: string;
  recordType: string;
  records: string[];
  timestamp: string;
};

const DnsPropagationTool = () => {
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState<string>("A");
  const [result, setResult] = useState<PropagationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!domain.trim()) return;
    setError("");
    setLoading(true);
    try {
      const data = await checkDnsPropagation(domain.trim(), recordType);
      setResult(data);
    } catch (err: unknown) {
      setError(formatApiError(err, "Error al consultar la propagacion DNS"));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1 className="public-title mb-2">Propagacion DNS</h1>
      <p className="public-lead mb-6">Consultar registros DNS desde el servidor.</p>

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
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">Tipo</label>
            <ToolSelect
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
            >
              {RECORD_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </ToolSelect>
          </div>
          <ToolButton onClick={handleCheck} disabled={loading}>
            {loading ? "Consultando..." : "Consultar"}
          </ToolButton>
        </div>

        {result && (
          <div>
            <div className="mb-2 flex items-center gap-3 text-sm text-text-muted">
              <span>Tipo: <strong className="text-text-primary">{result.recordType}</strong></span>
              <span>Registros: <strong className="text-text-primary">{result.records?.length ?? 0}</strong></span>
            </div>
            {result.records && result.records.length > 0 ? (
              <ul className="space-y-1 rounded-lg border border-slate-600/80 bg-surface-900/80 p-3">
                {result.records.map((record, index) => (
                  <li key={index} className="font-mono text-sm text-text-primary">{record}</li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg border border-slate-600/80 bg-surface-900/80 p-3 text-text-muted">
                No se encontraron registros {result.recordType} para este dominio.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default DnsPropagationTool;
