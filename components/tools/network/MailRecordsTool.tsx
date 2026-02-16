import { useState } from "react";
import { getMailRecords } from "@/api/tools";
import { formatApiError } from "@/utils/format-api-error";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolButton from "@/components/UI/ToolButton";
import { ToolInput } from "@/components/UI/ToolInput";

type MailResult = {
  domain: string;
  mx: string[];
  spf: string[];
  dkim: string[];
  dmarc: string[];
};

type RecordSectionProps = {
  title: string;
  records: string[] | null;
};

const RecordSection = ({ title, records }: RecordSectionProps) => {
  const found = records && records.length > 0;
  return (
    <div className="rounded-lg border border-slate-700/60 bg-surface-900/60 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${found ? "bg-emerald-400" : "bg-slate-500"}`} />
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      {found ? (
        <ul className="space-y-1">
          {records.map((record, index) => (
            <li key={index} className="break-all font-mono text-xs text-text-secondary">{record}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-text-muted">No se encontraron registros.</p>
      )}
    </div>
  );
};

const MailRecordsTool = () => {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<MailResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!domain.trim()) return;
    setError("");
    setLoading(true);
    try {
      const data = await getMailRecords(domain.trim());
      setResult(data);
    } catch (err: unknown) {
      setError(formatApiError(err, "Error al consultar los registros de correo"));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1 className="public-title mb-2">Registros de Correo</h1>
      <p className="public-lead mb-6">Consultar MX, SPF, DKIM y DMARC de un dominio.</p>

      {error && <ErrorAlert message={error} />}

      <div className="public-card mb-6">
        <div className="flex flex-wrap items-end gap-3">
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
          <ToolButton onClick={handleCheck} disabled={loading}>
            {loading ? "Consultando..." : "Consultar"}
          </ToolButton>
        </div>
      </div>

      {result && (
        <div className="grid gap-4 sm:grid-cols-2">
          <RecordSection title="MX (Mail Exchange)" records={result.mx} />
          <RecordSection title="SPF (Sender Policy Framework)" records={result.spf} />
          <RecordSection title="DKIM (DomainKeys)" records={result.dkim} />
          <RecordSection title="DMARC (Domain-based Auth)" records={result.dmarc} />
        </div>
      )}
    </section>
  );
};

export default MailRecordsTool;
