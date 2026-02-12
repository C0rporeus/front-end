import { apiRequest } from "@/api/http-client";

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

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function getOpsMetrics(token: string) {
  return apiRequest<OpsMetrics>("/api/private/ops/metrics", {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function getOpsAlerts(token: string) {
  return apiRequest<OpsAlerts>("/api/private/ops/alerts", {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function getOpsHealth(token: string) {
  return apiRequest<OpsHealth>("/api/private/ops/health", {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function getOpsHistory(token: string) {
  return apiRequest<OpsHistory>("/api/private/ops/history", {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function getOpsSummary(token: string) {
  return apiRequest<OpsSummary>("/api/private/ops/summary", {
    method: "GET",
    headers: authHeaders(token),
  });
}
