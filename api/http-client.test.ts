import { apiRequest, ApiClientError } from "./http-client";

describe("http-client", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("returns parsed payload on success", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ value: 42 }),
      headers: new Headers(),
    }) as unknown as typeof fetch;

    const result = await apiRequest<{ value: number }>("/api/ping", { method: "GET" });
    expect(result.value).toBe(42);
  });

  it("throws ApiClientError with requestId on failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: async () => JSON.stringify({ code: "bad_request", message: "request failed", details: { a: 1 } }),
      headers: new Headers({ "X-Request-ID": "req-abc" }),
    }) as unknown as typeof fetch;

    await expect(apiRequest("/api/fail")).rejects.toMatchObject({
      name: "ApiClientError",
      message: "request failed",
      requestId: "req-abc",
    } as Partial<ApiClientError>);
  });

  it("dispatches auth:expired event on 401 response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ code: "unauthorized", message: "Token expirado" }),
      headers: new Headers(),
    }) as unknown as typeof fetch;

    const handler = jest.fn();
    window.addEventListener("auth:expired", handler);

    await expect(apiRequest("/api/private/me")).rejects.toMatchObject({
      name: "ApiClientError",
      message: "Token expirado",
    } as Partial<ApiClientError>);

    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener("auth:expired", handler);
  });

  it("still throws error after dispatching auth:expired on 401", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ code: "unauthorized", message: "Sesion expirada", details: { requestId: "req-401" } }),
      headers: new Headers({ "X-Request-ID": "req-401" }),
    }) as unknown as typeof fetch;

    await expect(apiRequest("/api/private/data")).rejects.toMatchObject({
      name: "ApiClientError",
      code: "unauthorized",
      requestId: "req-401",
    } as Partial<ApiClientError>);
  });

  it("handles non-json payloads safely", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: async () => "plain text failure",
      headers: new Headers(),
    }) as unknown as typeof fetch;

    await expect(apiRequest("/api/fail-plain")).rejects.toMatchObject({
      name: "ApiClientError",
      message: "No fue posible procesar la solicitud",
    } as Partial<ApiClientError>);
  });
});
