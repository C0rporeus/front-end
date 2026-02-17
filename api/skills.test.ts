import {
  listPublicSkills,
  listPrivateSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  clearPublicSkillsCache,
} from "./skills";

describe("skills api", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
    clearPublicSkillsCache();
  });

  const mockSkill = { id: "1", title: "Go", summary: "Backend", body: "desc", imageUrls: [], tags: [], visibility: "public" as const, createdAt: "", updatedAt: "" };

  it("requests public skills", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ items: [mockSkill] }),
      headers: new Headers(),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await listPublicSkills();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Go");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/skills"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("normalizes missing imageUrls", async () => {
    const noImages = { ...mockSkill, imageUrls: undefined };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ items: [noImages] }),
      headers: new Headers(),
    }) as unknown as typeof fetch;

    const result = await listPublicSkills();
    expect(Array.isArray(result[0].imageUrls)).toBe(true);
  });

  it("sends bearer token for private list", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ items: [] }),
      headers: new Headers(),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await listPrivateSkills("tok-123");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer tok-123" }),
      }),
    );
  });

  it("handles create update delete calls", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ...mockSkill, deleted: true }),
      headers: new Headers(),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const payload = { title: "Go", summary: "Backend", body: "desc", imageUrls: [], tags: [], visibility: "public" as const };
    await createSkill("tok", payload);
    await updateSkill("tok", "1", payload);
    await deleteSkill("tok", "1");

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
