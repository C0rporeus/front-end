import { apiAuthRequest } from "@/api/http-client";
import { API_PRIVATE_OPS_METRICS, API_PRIVATE_OPS_ALERTS, API_PRIVATE_OPS_HEALTH, API_PRIVATE_OPS_HISTORY, API_PRIVATE_OPS_SUMMARY } from "@/api/endpoints";

export type OpsMetrics = {
  startedAtUnix: number;
  requestsTotal: number;
  errors5xx: number;
  authFailures: number;
  errorRate: number;
  authFailRate: number;
  window: {
    seconds: number;
    requests: number;
    errors5xx: number;
    authFailures: number;
    errorRate: number;
    authFailRate: number;
  };
};

export type OpsAlerts = {
  level: "ok" | "warn" | "critical";
  reasons: string[];
  evaluationScope: "window" | "total";
  thresholds: {
    minRequests: number;
    warn5xxRate: number;
    critical5xxRate: number;
    warnAuthFailRate: number;
    criticalAuthFailRate: number;
  };
  snapshot: OpsMetrics;
};

export type OpsHealth = {
  status: "ok" | "warn" | "critical";
  generatedAtUnix: number;
  alerts: OpsAlerts;
  recommendations: string[];
};

export type OpsHistoryItem = {
  timestampUnix: number;
  status: "ok" | "warn" | "critical";
  scope: "window" | "total";
  requestsTotal: number;
  windowRequests: number;
  errorRate: number;
  authFailRate: number;
  reasons: string[];
};

export type OpsHistory = {
  items: OpsHistoryItem[];
  count: number;
};

export type OpsSummary = {
  status: "ok" | "warn" | "critical";
  samples: {
    size: number;
    count: number;
  };
  distribution: {
    ok: number;
    warn: number;
    critical: number;
  };
  averages: {
    errorRate: number;
    authFailRate: number;
  };
  currentHealth: OpsHealth;
};

export function getOpsMetrics(token: string) {
  return apiAuthRequest<OpsMetrics>(API_PRIVATE_OPS_METRICS, token, { method: "GET" });
}

export function getOpsAlerts(token: string) {
  return apiAuthRequest<OpsAlerts>(API_PRIVATE_OPS_ALERTS, token, { method: "GET" });
}

export function getOpsHealth(token: string) {
  return apiAuthRequest<OpsHealth>(API_PRIVATE_OPS_HEALTH, token, { method: "GET" });
}

export function getOpsHistory(token: string) {
  return apiAuthRequest<OpsHistory>(API_PRIVATE_OPS_HISTORY, token, { method: "GET" });
}

export function getOpsSummary(token: string) {
  return apiAuthRequest<OpsSummary>(API_PRIVATE_OPS_SUMMARY, token, { method: "GET" });
}
