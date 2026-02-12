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
