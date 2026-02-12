import { apiRequest } from "@/api/http-client";

type JsonRecord = Record<string, unknown>;

export function encodeBase64(value: string) {
  return apiRequest<{ encoded: string; input: string }>("/api/tools/base64/encode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value } as JsonRecord),
  });
}

export function decodeBase64(value: string) {
  return apiRequest<{ decoded: string; input: string }>("/api/tools/base64/decode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value } as JsonRecord),
  });
}

export function generateUUIDv4() {
  return apiRequest<{ uuid: string }>("/api/tools/uuid/v4", { method: "GET" });
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
  }>("/api/tools/certs/self-signed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
