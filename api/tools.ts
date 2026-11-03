import { apiRequest } from "@/api/http-client";
import { API_TOOLS_BASE64_ENCODE, API_TOOLS_BASE64_DECODE, API_TOOLS_UUID_V4, API_TOOLS_DNS_RESOLVE, API_TOOLS_DNS_PROPAGATION, API_TOOLS_DNS_MAIL_AUDIT, API_TOOLS_DNS_BLACKLIST } from "@/api/endpoints";

type JsonRecord = Record<string, unknown>;

/** `std`: RFC 4648 §4 con relleno. `url`: RFC 4648 §5 sin relleno (la que usan los JWT). */
export type Base64Variant = "std" | "url";

export function encodeBase64(value: string, variant: Base64Variant = "std") {
  return apiRequest<{ encoded: string; input: string; variant?: Base64Variant }>(API_TOOLS_BASE64_ENCODE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value, variant } as JsonRecord),
  });
}

export function decodeBase64(value: string, variant: Base64Variant = "std") {
  return apiRequest<{ decoded: string; input: string; variant?: Base64Variant }>(API_TOOLS_BASE64_DECODE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value, variant } as JsonRecord),
  });
}

export function generateUUIDv4() {
  return apiRequest<{ uuid: string }>(API_TOOLS_UUID_V4, { method: "GET" });
}

export function resolveDomain(domain: string) {
  return apiRequest<{ domain: string; ipv4: string[]; ipv6: string[]; resolved: boolean; status?: DnsStatus }>(
    `${API_TOOLS_DNS_RESOLVE}?domain=${encodeURIComponent(domain)}`,
    { method: "GET" }
  );
}

export function checkDnsPropagation(domain: string, recordType: string) {
  return apiRequest<{ domain: string; recordType: string; records: string[]; timestamp: string; status?: DnsStatus }>(
    `${API_TOOLS_DNS_PROPAGATION}?domain=${encodeURIComponent(domain)}&type=${encodeURIComponent(recordType)}`,
    { method: "GET" }
  );
}

export type AuditSeverity = "critical" | "warning" | "info" | "ok";
export type MailAuditSectionId = "mx" | "spf" | "dkim" | "dmarc" | "mta-sts" | "tls-rpt";

export type AuditFinding = {
  id: string;
  section: MailAuditSectionId;
  severity: AuditSeverity;
  title: string;
  detail?: string;
  remediation?: string;
};

export type MailAuditSection = {
  status: DnsStatus;
  records: string[] | null;
  /** Solo SPF: lookups DNS contados (límite RFC 7208 = 10). */
  lookups?: number;
  includes?: string[] | null;
  /** Solo DKIM: selectores que publican una clave. */
  selectors?: string[] | null;
};

export type MailAuditResponse = {
  domain: string;
  summary: Record<AuditSeverity, number>;
  findings: AuditFinding[];
  sections: Record<MailAuditSectionId, MailAuditSection>;
};

/** Audita MX, SPF, DKIM, DMARC, MTA-STS y TLS-RPT; `selector` añade un selector DKIM propio. */
export function auditMail(domain: string, selector?: string) {
  const query = new URLSearchParams({ domain });
  if (selector) query.set("selector", selector);
  return apiRequest<MailAuditResponse>(`${API_TOOLS_DNS_MAIL_AUDIT}?${query.toString()}`, { method: "GET" });
}

/** Resultado de una consulta DNS: `ok` con registros; el resto explica por qué no hay. */
export type DnsStatus = "ok" | "not_found" | "timeout" | "servfail" | "error";

/** `error` significa que la lista no se pudo consultar: nunca equivale a "limpia". */
export type BlacklistEntryStatus = "listed" | "not_listed" | "error";

export type BlacklistEntry = {
  provider: string;
  status: BlacklistEntryStatus;
  listed: boolean;
  codes?: string[];
  error?: string;
};

export type BlacklistResponse = { ip: string; results: BlacklistEntry[] };

export function checkBlacklist(ip: string) {
  return apiRequest<BlacklistResponse>(
    `${API_TOOLS_DNS_BLACKLIST}?ip=${encodeURIComponent(ip)}`,
    { method: "GET" }
  );
}
