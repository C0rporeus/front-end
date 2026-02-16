import { apiRequest } from "@/api/http-client";
import { API_TOOLS_BASE64_ENCODE, API_TOOLS_BASE64_DECODE, API_TOOLS_UUID_V4, API_TOOLS_CERTS_SELF_SIGNED, API_TOOLS_DNS_RESOLVE, API_TOOLS_DNS_PROPAGATION, API_TOOLS_DNS_MAIL_RECORDS, API_TOOLS_DNS_BLACKLIST } from "@/api/endpoints";

type JsonRecord = Record<string, unknown>;

export function encodeBase64(value: string) {
  return apiRequest<{ encoded: string; input: string }>(API_TOOLS_BASE64_ENCODE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value } as JsonRecord),
  });
}

export function decodeBase64(value: string) {
  return apiRequest<{ decoded: string; input: string }>(API_TOOLS_BASE64_DECODE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value } as JsonRecord),
  });
}

export function generateUUIDv4() {
  return apiRequest<{ uuid: string }>(API_TOOLS_UUID_V4, { method: "GET" });
}

export function generateSelfSignedCert(payload: {
  commonName: string;
  organization: string;
  validDays: number;
  password: string;
}) {
  return apiRequest<{
    certPem: string;
    keyPem: string;
    certBase64: string;
    pfxBase64: string;
    password: string;
  }>(API_TOOLS_CERTS_SELF_SIGNED, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function resolveDomain(domain: string) {
  return apiRequest<{ domain: string; ipv4: string[]; ipv6: string[]; resolved: boolean }>(
    `${API_TOOLS_DNS_RESOLVE}?domain=${encodeURIComponent(domain)}`,
    { method: "GET" }
  );
}

export function checkDnsPropagation(domain: string, recordType: string) {
  return apiRequest<{ domain: string; recordType: string; records: string[]; timestamp: string }>(
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

export function checkBlacklist(ip: string) {
  return apiRequest<{ ip: string; results: Array<{ provider: string; listed: boolean }> }>(
    `${API_TOOLS_DNS_BLACKLIST}?ip=${encodeURIComponent(ip)}`,
    { method: "GET" }
  );
}
