import { ApiClientError } from "@/api/http-client";
import { formatApiError } from "./format-api-error";

describe("formatApiError", () => {
  it("returns message with request reference for ApiClientError", () => {
    const error = new ApiClientError("Fallo", { requestId: "req-22" });
    expect(formatApiError(error, "fallback")).toBe("Fallo (ref: req-22)");
  });

  it("uses details.requestId when direct requestId is missing", () => {
    const error = new ApiClientError("Fallo detalle", {
      details: { requestId: "req-detail" },
    });
    expect(formatApiError(error, "fallback")).toBe("Fallo detalle (ref: req-detail)");
  });

  it("uses details.context.requestId when available", () => {
    const error = new ApiClientError("Fallo contexto", {
      details: { context: { requestId: "req-context" } },
    });
    expect(formatApiError(error, "fallback")).toBe("Fallo contexto (ref: req-context)");
  });

  it("returns message without reference if requestId is absent", () => {
    const error = new ApiClientError("Sin referencia");
    expect(formatApiError(error, "fallback")).toBe("Sin referencia");
  });

  it("returns message for generic Error", () => {
    expect(formatApiError(new Error("X"), "fallback")).toBe("X");
  });

  it("returns fallback for unknown values", () => {
    expect(formatApiError("bad", "fallback")).toBe("fallback");
  });
});
