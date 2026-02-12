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
    }) as any;

    const result = await loginUser({ email: "mail@test.com", password: "1234" });
    expect(result.token).toBe("token-123");
  });

  it("throws with API message on failed register", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: async () => JSON.stringify({ code: "user_already_exists", message: "El usuario ya existe" }),
      headers: new Headers({ "X-Request-ID": "req-1" }),
    }) as any;

    await expect(registerUser({ email: "mail@test.com", password: "1234" })).rejects.toThrow(
      "El usuario ya existe"
    );
  });
});
