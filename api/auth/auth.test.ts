import { loginUser, registerUser, refreshToken } from "./auth";

describe("auth api client", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("confirms successful login without exposing the JWT", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ authenticated: true }),
      headers: new Headers(),
    }) as unknown as typeof fetch;

    const result = await loginUser({ email: "mail@test.com", password: "1234" });
    expect(result.authenticated).toBe(true);
  });

  it("accepts the currently deployed legacy response but discards its token", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ token: "legacy-jwt" }),
      headers: new Headers(),
    }) as unknown as typeof fetch;

    const result = await loginUser({ email: "mail@test.com", password: "1234" });
    expect(result).toEqual({ authenticated: true, id: undefined, name: undefined, email: undefined });
    expect("token" in result).toBe(false);
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

  it("confirms refresh without exposing the JWT", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ authenticated: true }),
      headers: new Headers(),
    }) as unknown as typeof fetch;

    const result = await refreshToken();
    expect(result.authenticated).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/private/refresh"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
  });

  it("throws when refresh responds without token", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ message: "no session" }),
      headers: new Headers(),
    }) as unknown as typeof fetch;

    await expect(refreshToken()).rejects.toThrow(
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

    await expect(refreshToken()).rejects.toThrow("Token expirado");
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
