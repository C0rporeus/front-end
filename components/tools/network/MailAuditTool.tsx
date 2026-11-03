import { useState } from "react";
import { auditMail, type AuditFinding, type AuditSeverity, type MailAuditResponse, type MailAuditSectionId } from "@/api/tools";
import { dnsFailureMessage } from "@/utils/dns-status";
import { formatApiError } from "@/utils/format-api-error";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolButton from "@/components/UI/ToolButton";
import ToolOutput from "@/components/UI/ToolOutput";
import { ToolInput } from "@/components/UI/ToolInput";

const SECTION_TITLES: Record<MailAuditSectionId, string> = {
  mx: "MX (servidores de correo)",
  spf: "SPF (remitentes autorizados)",
  dkim: "DKIM (firma de mensajes)",
  dmarc: "DMARC (política de autenticación)",
  "mta-sts": "MTA-STS (TLS en correo entrante)",
  "tls-rpt": "TLS-RPT (reportes de TLS)",
};
const SECTION_ORDER: MailAuditSectionId[] = ["mx", "spf", "dkim", "dmarc", "mta-sts", "tls-rpt"];
const SPF_MAX_LOOKUPS = 10;

// El estado se comunica con texto además del color (accesibilidad).
const SEVERITY_STYLE: Record<AuditSeverity, { label: string; badge: string }> = {
  critical: { label: "Crítico", badge: "bg-rose-500/20 text-rose-200" },
  warning: { label: "Aviso", badge: "bg-amber-500/20 text-amber-200" },
  info: { label: "Info", badge: "bg-sky-500/20 text-sky-200" },
  ok: { label: "Correcto", badge: "bg-emerald-500/20 text-emerald-200" },
};

const SELECTOR_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

const isUnavailableFinding = (finding: AuditFinding) => finding.id.endsWith(".unavailable") || finding.id.endsWith("_unavailable");

/** Titular del resultado: lo que no pudo comprobarse nunca se presenta como correcto. */
const headline = (result: MailAuditResponse) => {
  const { critical, warning } = result.summary;
  const unchecked = result.findings.filter(isUnavailableFinding).length;
  const incompleteNote = unchecked > 0 ? ` · ${unchecked} comprobación${unchecked === 1 ? "" : "es"} sin completar` : "";
  if (critical > 0) {
    return { tone: "bad", text: `${critical} problema${critical === 1 ? "" : "s"} crítico${critical === 1 ? "" : "s"} que requieren corrección${incompleteNote}` };
  }
  if (unchecked > 0) {
    return { tone: "warn", text: `Auditoría incompleta: ${unchecked} comprobación${unchecked === 1 ? "" : "es"} no pudieron completarse` };
  }
  if (warning > 0) return { tone: "warn", text: `Sin problemas críticos, pero ${warning} aviso${warning === 1 ? "" : "s"} por revisar` };
  return { tone: "ok", text: "No se encontraron problemas ni avisos" };
};

const TONE_DOT: Record<string, string> = { ok: "bg-emerald-400", warn: "bg-amber-400", bad: "bg-rose-400" };

const FindingItem = ({ finding }: { finding: AuditFinding }) => {
  const style = SEVERITY_STYLE[finding.severity];
  return (
    <li className="rounded-lg border border-slate-700/60 bg-surface-900/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${style.badge}`}>{style.label}</span>
        <span className="text-sm font-medium text-text-primary">{finding.title}</span>
      </div>
      {finding.detail && <p className="mt-2 text-sm text-text-secondary">{finding.detail}</p>}
      {finding.remediation && (
        <p className="mt-2 text-sm text-text-secondary">
          <strong className="text-text-primary">Cómo corregirlo: </strong>
          {finding.remediation}
        </p>
      )}
    </li>
  );
};

const MailAuditTool = () => {
  const [domain, setDomain] = useState("");
  const [selector, setSelector] = useState("");
  const [result, setResult] = useState<MailAuditResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAudit = async () => {
    const target = domain.trim().toLowerCase();
    const dkimSelector = selector.trim().toLowerCase();
    if (!target) return;
    if (dkimSelector && (dkimSelector.length > 63 || !SELECTOR_REGEX.test(dkimSelector))) {
      setError("El selector DKIM solo admite letras, números, guiones y puntos");
      return;
    }
    setError("");
    setLoading(true);
    try {
      setResult(await auditMail(target, dkimSelector || undefined));
    } catch (err: unknown) {
      setError(formatApiError(err, "Error al auditar el dominio", { bypassSafeMessage: true }));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const summary = result ? headline(result) : null;

  return (
    <section>
      <h1 className="public-title mb-2">Auditor de correo</h1>
      <p className="public-lead mb-6">
        Audita SPF (con conteo de lookups), DKIM, DMARC, MX, MTA-STS y TLS-RPT de un dominio, con hallazgos por severidad y cómo corregirlos.
        Un registro que no se puede consultar se indica aparte: nunca cuenta como correcto.
      </p>

      {error && <ErrorAlert message={error} />}

      <div className="public-card mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block flex-1 text-sm text-text-secondary">
            Dominio
            <ToolInput
              className="mt-1 w-full"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="ejemplo.com"
              onKeyDown={(e) => e.key === "Enter" && handleAudit()}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <label className="block w-full text-sm text-text-secondary sm:w-56">
            Selector DKIM (opcional)
            <ToolInput
              className="mt-1 w-full"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              placeholder="mail2026"
              onKeyDown={(e) => e.key === "Enter" && handleAudit()}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <ToolButton onClick={handleAudit} disabled={loading}>
            {loading ? "Auditando..." : "Auditar"}
          </ToolButton>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Solo se consultan registros DNS públicos del dominio. DKIM usa selectores arbitrarios: se prueban los habituales y el que indiques.
        </p>
      </div>

      {result && summary && (
        <div className="space-y-4">
          <div className="public-card">
            <div className="flex flex-wrap items-center gap-3" role="status">
              <span className={`inline-block h-3 w-3 rounded-full ${TONE_DOT[summary.tone]}`} />
              <span className="text-sm font-semibold text-text-primary">{summary.text}</span>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2 text-xs" aria-label="Resumen por severidad">
              {(Object.keys(SEVERITY_STYLE) as AuditSeverity[]).map((severity) => (
                <li key={severity} className={`rounded px-2 py-1 font-medium ${SEVERITY_STYLE[severity].badge}`}>
                  {SEVERITY_STYLE[severity].label}: {result.summary[severity] ?? 0}
                </li>
              ))}
            </ul>
          </div>

          {SECTION_ORDER.map((id) => {
            const section = result.sections[id];
            const findings = result.findings.filter((finding) => finding.section === id);
            const failure = dnsFailureMessage(section?.status);
            const records = section?.records ?? [];
            return (
              <div key={id} className="public-card" aria-label={SECTION_TITLES[id]} role="group">
                <h2 className="mb-1 text-base font-semibold text-text-primary">{SECTION_TITLES[id]}</h2>
                {id === "spf" && typeof section?.lookups === "number" && (
                  <p className="mb-2 text-xs text-text-muted">
                    Lookups DNS: <strong className="text-text-secondary">{section.lookups}</strong> de {SPF_MAX_LOOKUPS} permitidos
                  </p>
                )}
                {failure && <p className="mb-2 text-sm text-amber-200">{failure}</p>}
                <ul className="space-y-2">
                  {findings.map((finding, index) => (
                    <FindingItem key={`${finding.id}-${index}`} finding={finding} />
                  ))}
                </ul>
                {records.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-text-secondary">Registros publicados ({records.length})</summary>
                    <ToolOutput className="mt-2 whitespace-pre-wrap break-all text-xs">{records.join("\n")}</ToolOutput>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MailAuditTool;
