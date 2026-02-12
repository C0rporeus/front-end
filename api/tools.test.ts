import { decodeBase64, encodeBase64, generateSelfSignedCert, generateUUIDv4 } from "./tools";

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

  it("calls uuid and cert endpoints", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ uuid: "u-1", certPem: "", keyPem: "", certBase64: "", pfxBase64: "", password: "x" }),
      headers: new Headers(),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await generateUUIDv4();
    await generateSelfSignedCert({
      commonName: "localhost",
      organization: "test",
      validDays: 30,
      password: "secret",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
