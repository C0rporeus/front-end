import { loginUser, registerUser, refreshToken } from "./auth";

describe("auth api client", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("returns token on successful login", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ token: "token-123" }),
      headers: new Headers(),
    }) as unknown as typeof fetch;

    const result = await loginUser({ email: "mail@test.com", password: "1234" });
    expect(result.token).toBe("token-123");
  });

  it("throws with API message on failed register", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: async () => JSON.stringify({ code: "user_already_exists", message: "El usuario ya existe" }),
      headers: new Headers({ "X-Request-ID": "req-1" }),
    }) as unknown as typeof fetch;

    await expect(registerUser({ email: "mail@test.com", password: "1234" })).rejects.toThrow(
      "El usuario ya existe"
    );
  });

  it("returns a new token on successful refresh", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ token: "refreshed-token" }),
      headers: new Headers(),
    }) as unknown as typeof fetch;

    const result = await refreshToken("old-token");
    expect(result.token).toBe("refreshed-token");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/private/refresh"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer old-token" }),
      }),
    );
  });

  it("throws when refresh responds without token", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ message: "no token" }),
      headers: new Headers(),
    }) as unknown as typeof fetch;

    await expect(refreshToken("old-token")).rejects.toThrow(
      "No fue posible renovar la sesion"
    );
  });

  it("throws when refresh gets 401 (expired token)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ code: "unauthorized", message: "Token expirado" }),
      headers: new Headers(),
    }) as unknown as typeof fetch;

    await expect(refreshToken("expired-token")).rejects.toThrow("Token expirado");
  });

  it("throws when API responds without token", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ message: "missing token" }),
      headers: new Headers(),
    }) as unknown as typeof fetch;

    await expect(loginUser({ email: "mail@test.com", password: "1234" })).rejects.toThrow(
      "No fue posible completar la autenticacion"
    );
  });
});
