import { auditMail, decodeBase64, encodeBase64, generateUUIDv4 } from "./tools";

describe("tools api", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("calls encode and decode endpoints", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ encoded: "aG9sYQ==", decoded: "hola", input: "hola" }),
      headers: new Headers(),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await encodeBase64("hola");
    await decodeBase64("aG9sYQ==");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("sends the base64 variant (default std, url on request)", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ encoded: "Zg", input: "f" }),
      headers: new Headers(),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await encodeBase64("f");
    await encodeBase64("f", "url");
    const bodies = fetchMock.mock.calls.map((call) => JSON.parse(call[1].body as string));
    expect(bodies).toEqual([
      { value: "f", variant: "std" },
      { value: "f", variant: "url" },
    ]);
  });

  it("calls the uuid endpoint", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ uuid: "u-1" }),
      headers: new Headers(),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await generateUUIDv4();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("has no server endpoint for certificates (they are generated in the browser)", async () => {
    const tools = await import("./tools");
    expect("generateSelfSignedCert" in tools).toBe(false);
  });

  it("builds the mail-audit query with an optional, encoded selector", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ domain: "example.com", summary: {}, findings: [], sections: {} }),
      headers: new Headers(),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await auditMail("example.com");
    await auditMail("example.com", "mail 2026");
    const urls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(urls[0]).toMatch(/\/api\/tools\/dns\/mail-audit\?domain=example\.com$/);
    expect(urls[1]).toMatch(/domain=example\.com&selector=mail\+2026$/);
  });
});
