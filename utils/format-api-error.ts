import { ApiClientError } from "@/api/http-client";

function extractRequestId(details: unknown): string | undefined {
  if (!details || typeof details !== "object") {
    return undefined;
  }

  const detailsRecord = details as { requestId?: unknown; context?: { requestId?: unknown } };
  if (typeof detailsRecord.requestId === "string" && detailsRecord.requestId) {
    return detailsRecord.requestId;
  }
  if (
    detailsRecord.context &&
    typeof detailsRecord.context.requestId === "string" &&
    detailsRecord.context.requestId
  ) {
    return detailsRecord.context.requestId;
  }
  return undefined;
}

export function formatApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    const requestId = error.requestId || extractRequestId(error.details);
    if (requestId) {
      return `${error.message} (ref: ${requestId})`;
    }
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}
