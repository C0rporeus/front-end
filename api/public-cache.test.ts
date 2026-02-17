import { getPublicCached, invalidatePublicCache } from "./public-cache";

describe("public-cache", () => {
  beforeEach(() => {
    invalidatePublicCache(["test-key", "stale-key"]);
    localStorage.clear();
  });

  it("returns fresh data from fetcher on first call", async () => {
    const fetcher = jest.fn().mockResolvedValue({ items: [1, 2] });
    const result = await getPublicCached("test-key", fetcher);
    expect(result).toEqual({ items: [1, 2] });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("returns cached data without calling fetcher on second call", async () => {
    const fetcher = jest.fn().mockResolvedValue({ value: "a" });
    await getPublicCached("test-key", fetcher, { ttlMs: 10_000 });
    const result = await getPublicCached("test-key", fetcher, { ttlMs: 10_000 });
    expect(result).toEqual({ value: "a" });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("invalidates cache and re-fetches", async () => {
    const fetcher = jest.fn()
      .mockResolvedValueOnce({ v: 1 })
      .mockResolvedValueOnce({ v: 2 });

    await getPublicCached("test-key", fetcher, { ttlMs: 10_000 });
    invalidatePublicCache(["test-key"]);
    const result = await getPublicCached("test-key", fetcher, { ttlMs: 10_000 });
    expect(result).toEqual({ v: 2 });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("returns stale data on fetch error when allowStaleOnError is true", async () => {
    const fetcher = jest.fn()
      .mockResolvedValueOnce({ stale: true })
      .mockRejectedValueOnce(new Error("network"));

    await getPublicCached("stale-key", fetcher, { ttlMs: 1 });

    // Wait for TTL to expire
    await new Promise((r) => setTimeout(r, 10));

    const result = await getPublicCached("stale-key", fetcher, {
      ttlMs: 1,
      allowStaleOnError: true,
    });
    expect(result).toEqual({ stale: true });
  });

  it("throws on fetch error when no stale cache available", async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error("fail"));
    await expect(getPublicCached("test-key", fetcher)).rejects.toThrow("fail");
  });
});
