import { ApiClientError } from "@/api/http-client";

type FormatApiErrorOptions = {
  bypassSafeMessage?: boolean;
};

function resolveSafeMessage(error: ApiClientError, fallback: string): string {
  if (error.code === "AUTH_INVALID_CREDENTIALS" || error.code === "AUTH_INVALID_TOKEN") {
    return "Las credenciales no son validas. Verifica tus datos e intenta nuevamente.";
  }

  if (error.code === "AUTH_FORBIDDEN") {
    return "No tienes permisos para realizar esta accion.";
  }

  if (error.code === "RESOURCE_NOT_FOUND") {
    return "No encontramos el recurso solicitado.";
  }

  if (error.code === "VALIDATION_ERROR" || error.code === "BAD_REQUEST") {
    return "Revisa los datos ingresados y vuelve a intentarlo.";
  }

  if (typeof error.code === "string" && error.code.startsWith("AUTH_")) {
    return "No fue posible validar tu sesion. Intenta nuevamente.";
  }

  if (typeof error.code === "string" && error.code.startsWith("OPS_")) {
    return "No fue posible consultar el estado operativo en este momento.";
  }

  if (typeof error.code === "string" && error.code.startsWith("TOOLS_")) {
    return "No pudimos completar esta herramienta por ahora. Intenta otra vez.";
  }

  if (typeof error.message === "string") {
    const normalizedMessage = error.message.toLowerCase();
    if (normalizedMessage.includes("unauthorized")) {
      return "Las credenciales no son validas. Verifica tus datos e intenta nuevamente.";
    }
  }

  return fallback;
}

export function formatApiError(error: unknown, fallback: string, options?: FormatApiErrorOptions): string {
  const shouldBypassSafeMessage = options?.bypassSafeMessage === true;

  if (error instanceof ApiClientError) {
    if (shouldBypassSafeMessage) {
      return error.message || fallback;
    }
    return resolveSafeMessage(error, fallback);
  }

  if (error instanceof Error) {
    if (shouldBypassSafeMessage) {
      return error.message || fallback;
    }
    return fallback;
  }

  return fallback;
}
