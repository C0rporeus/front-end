import { apiRequest } from "@/api/http-client";
import { API_TOOLS_BASE64_ENCODE, API_TOOLS_BASE64_DECODE, API_TOOLS_UUID_V4, API_TOOLS_DNS_RESOLVE, API_TOOLS_DNS_PROPAGATION, API_TOOLS_DNS_MAIL_RECORDS, API_TOOLS_DNS_BLACKLIST } from "@/api/endpoints";

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

export function getMailRecords(domain: string) {
  return apiRequest<{ domain: string; mx: string[]; spf: string[]; dkim: string[]; dmarc: string[] }>(
    `${API_TOOLS_DNS_MAIL_RECORDS}?domain=${encodeURIComponent(domain)}`,
    { method: "GET" }
  );
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
