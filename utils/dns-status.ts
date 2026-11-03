import type { DnsStatus } from "@/api/tools";

const FAILURE_MESSAGES: Record<Exclude<DnsStatus, "ok" | "not_found">, string> = {
  timeout: "La consulta DNS no respondió a tiempo (timeout)",
  servfail: "El servidor DNS devolvió un error (SERVFAIL)",
  error: "No se pudo completar la consulta DNS",
};

/**
 * Mensaje cuando la consulta DNS falló. Devuelve null si la consulta se completó
 * (con o sin registros): "no existe" y "no se pudo consultar" son cosas distintas.
 */
export function dnsFailureMessage(status: DnsStatus | undefined): string | null {
  if (!status || status === "ok" || status === "not_found") return null;
  return FAILURE_MESSAGES[status];
}
