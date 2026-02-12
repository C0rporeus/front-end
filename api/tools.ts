const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";

type JsonRecord = Record<string, unknown>;

async function request<T>(path: string, method: string, body?: JsonRecord): Promise<T> {
  const response = await fetch(`${baseURL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "No fue posible procesar la solicitud");
  }

  return data as T;
}

export function encodeBase64(value: string) {
  return request<{ encoded: string; input: string }>("/api/tools/base64/encode", "POST", { value });
}

export function decodeBase64(value: string) {
  return request<{ decoded: string; input: string }>("/api/tools/base64/decode", "POST", { value });
}

export function generateUUIDv4() {
  return request<{ uuid: string }>("/api/tools/uuid/v4", "GET");
}

export function generateSelfSignedCert(payload: {
  commonName: string;
  organization: string;
  validDays: number;
  password: string;
}) {
  return request<{
    certPem: string;
    keyPem: string;
    certBase64: string;
    pfxBase64: string;
    password: string;
  }>("/api/tools/certs/self-signed", "POST", payload);
}
