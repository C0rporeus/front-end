import { loginUser, registerUser } from "./auth";

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
