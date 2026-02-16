import { ApiClientError } from "@/api/http-client";
import { formatApiError } from "./format-api-error";

describe("formatApiError", () => {
  it("returns safe fallback for ApiClientError by default", () => {
    const error = new ApiClientError("Fallo", { requestId: "req-22" });
    expect(formatApiError(error, "fallback")).toBe("fallback");
  });

  it("returns human auth message when unauthorized text appears", () => {
    const error = new ApiClientError("Unauthorized", { requestId: "req-22" });
    expect(formatApiError(error, "fallback")).toBe(
      "Las credenciales no son validas. Verifica tus datos e intenta nuevamente.",
    );
  });

  it("returns mapped message for auth code", () => {
    const error = new ApiClientError("Cualquier error", {
      code: "AUTH_INVALID_CREDENTIALS",
    });
    expect(formatApiError(error, "fallback")).toBe(
      "Las credenciales no son validas. Verifica tus datos e intenta nuevamente.",
    );
  });

  it("returns mapped message for validation code", () => {
    const error = new ApiClientError("Cualquier error", {
      code: "VALIDATION_ERROR",
    });
    expect(formatApiError(error, "fallback")).toBe(
      "Revisa los datos ingresados y vuelve a intentarlo.",
    );
  });

  it("returns fallback for generic Error by default", () => {
    expect(formatApiError(new Error("X"), "fallback")).toBe("fallback");
  });

  it("returns fallback for unknown values", () => {
    expect(formatApiError("bad", "fallback")).toBe("fallback");
  });

  it("can bypass safe mode and expose original message", () => {
    const error = new ApiClientError("Fallo original");
    expect(formatApiError(error, "fallback", { bypassSafeMessage: true })).toBe(
      "Fallo original",
    );
  });
});
