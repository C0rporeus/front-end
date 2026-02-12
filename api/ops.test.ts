import { getOpsAlerts, getOpsHealth, getOpsHistory, getOpsMetrics, getOpsSummary } from "./ops";

describe("ops api", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("calls private ops endpoints with bearer token", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ items: [], count: 0 }),
      headers: new Headers(),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await getOpsMetrics("token-1");
    await getOpsAlerts("token-1");
    await getOpsHealth("token-1");
    await getOpsHistory("token-1");
    await getOpsSummary("token-1");

    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token-1" }),
      })
    );
  });
});
