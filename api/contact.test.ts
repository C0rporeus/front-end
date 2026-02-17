import { submitContact } from "./contact";

describe("contact api", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("sends contact form data", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ sent: true }),
      headers: new Headers(),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await submitContact({ name: "Jane", email: "jane@test.com", message: "Hola" });
    expect(result.sent).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/contact"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("throws on server error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ code: "internal", message: "Error interno" }),
      headers: new Headers(),
    }) as unknown as typeof fetch;

    await expect(submitContact({ name: "a", email: "b", message: "c" })).rejects.toThrow("Error interno");
  });
});
