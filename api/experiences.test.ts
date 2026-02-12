import {
  createExperience,
  deleteExperience,
  listPrivateExperiences,
  listPublicExperiences,
  updateExperience,
} from "./experiences";

describe("experiences api", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("requests public experiences", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ items: [] }),
      headers: new Headers(),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await listPublicExperiences();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/experiences"),
      expect.objectContaining({ method: "GET" })
    );
  });

  it("sends bearer token for private list", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ items: [] }),
      headers: new Headers(),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await listPrivateExperiences("token-x");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token-x" }),
      })
    );
  });

  it("handles create update delete calls", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ id: "1", deleted: true }),
      headers: new Headers(),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const payload = { title: "a", summary: "b", body: "c", tags: ["x"], visibility: "public" as const };
    await createExperience("token-x", payload);
    await updateExperience("token-x", "id-1", payload);
    await deleteExperience("token-x", "id-1");

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
