export type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: unknown;
};

export class ApiClientError extends Error {
  code?: string;
  details?: unknown;
  requestId?: string;

  constructor(message: string, options?: { code?: string; details?: unknown; requestId?: string }) {
    super(message);
    Object.setPrototypeOf(this, ApiClientError.prototype);
    this.name = "ApiClientError";
    this.code = options?.code;
    this.details = options?.details;
    this.requestId = options?.requestId;
  }
}

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";

async function safeJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${baseURL}${path}`, options);
  const data = (await safeJson(response)) as ApiErrorPayload & T;

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }
    throw new ApiClientError(data.message || "No fue posible procesar la solicitud", {
      code: data.code,
      details: data.details,
      requestId: response.headers.get("X-Request-ID") || undefined,
    });
  }

  return data as T;
}

export function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function apiAuthRequest<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = {
    ...authHeaders(token),
    ...(options?.body ? { "Content-Type": "application/json" } : {}),
    ...(options?.headers as Record<string, string>),
  };

  return apiRequest<T>(path, { ...options, headers });
}
