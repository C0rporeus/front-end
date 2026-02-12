import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import {
  createExperience,
  deleteExperience,
  listPrivateExperiences,
  updateExperience,
} from "@/api/experiences";
import {
  getOpsAlerts,
  getOpsHealth,
  getOpsHistory,
  getOpsMetrics,
  OpsAlerts,
  OpsHealth,
  OpsHistoryItem,
  OpsMetrics,
  OpsSummary,
  getOpsSummary,
} from "@/api/ops";
import { useAuth } from "@/context/auth-context";
import { Experience, ExperiencePayload } from "@/interfaces/Experience";
import { formatApiError } from "@/utils/format-api-error";

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, logout, token } = useAuth();
  const [items, setItems] = useState<Experience[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [opsLoading, setOpsLoading] = useState(false);
  const [opsMetrics, setOpsMetrics] = useState<OpsMetrics | null>(null);
  const [opsAlerts, setOpsAlerts] = useState<OpsAlerts | null>(null);
  const [opsHealth, setOpsHealth] = useState<OpsHealth | null>(null);
  const [opsHistory, setOpsHistory] = useState<OpsHistoryItem[]>([]);
  const [opsSummary, setOpsSummary] = useState<OpsSummary | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExperiencePayload>({
    title: "",
    summary: "",
    body: "",
    tags: [],
    visibility: "public",
  });

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [items]
  );

  const refreshItems = useCallback(async () => {
    if (!token) return;
    const result = await listPrivateExperiences(token);
    setItems(result);
  }, [token]);

  const refreshOps = useCallback(async () => {
    if (!token) return;
    setOpsLoading(true);
    try {
      const [metrics, alerts, health] = await Promise.all([
        getOpsMetrics(token),
        getOpsAlerts(token),
        getOpsHealth(token),
      ]);
      const [history, summary] = await Promise.all([getOpsHistory(token), getOpsSummary(token)]);
      setOpsMetrics(metrics);
      setOpsAlerts(alerts);
      setOpsHealth(health);
      setOpsHistory(history.items);
      setOpsSummary(summary);
    } finally {
      setOpsLoading(false);
    }
  }, [token]);

  const semaphoreClass = (status?: string) => {
    if (status === "critical") return "bg-red-600 text-white";
    if (status === "warn") return "bg-amber-500 text-black";
    return "bg-emerald-600 text-white";
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace("/auth/login");
      return;
    }

    refreshItems()
      .catch((err: unknown) => setError(formatApiError(err, "No se pudo cargar el contenido")))
      .finally(() => setLoading(false));

    refreshOps().catch((err: unknown) => setError(formatApiError(err, "No se pudo cargar observabilidad")));
  }, [isAuthenticated, router, token, refreshItems, refreshOps]);

  if (!isAuthenticated) {
    return null;
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setError("");
    try {
      if (editingId) {
        await updateExperience(token, editingId, form);
      } else {
        await createExperience(token, form);
      }
      setForm({
        title: "",
        summary: "",
        body: "",
        tags: [],
        visibility: "public",
      });
      setEditingId(null);
      await refreshItems();
    } catch (err: unknown) {
      setError(formatApiError(err, "No fue posible guardar"));
    }
  };

  return (
    <>
      <Head>
        <title>Admin | Portfolio Dev</title>
      </Head>
      <main className="max-w-4xl mx-auto py-10 px-4 text-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestion privada del portafolio</h1>
          <button
            className="px-3 py-2 bg-gray-800 text-white rounded"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            Cerrar sesion
          </button>
        </div>

        <section className="p-4 border rounded bg-white mb-4">
          <h2 className="text-xl font-semibold mb-2">Contenido profesional</h2>
          <p>
            Aqui podras gestionar experiencias, hitos, articulos y evidencia tecnica del portafolio.
            Esta version habilita CRUD inicial de experiencias para alimentar el portafolio publico.
          </p>
        </section>

        {error && <p className="mb-4 text-red-600">{error}</p>}

        <section className="p-4 border rounded bg-white mb-4">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Editar experiencia" : "Nueva experiencia"}
          </h2>
          <form className="grid gap-3" onSubmit={onSubmit}>
            <input
              className="border rounded p-2"
              placeholder="Titulo"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
            <input
              className="border rounded p-2"
              placeholder="Resumen"
              value={form.summary}
              onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
            />
            <textarea
              className="border rounded p-2"
              rows={4}
              placeholder="Detalle"
              value={form.body}
              onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            />
            <input
              className="border rounded p-2"
              placeholder="Tags separados por coma"
              value={form.tags.join(", ")}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  tags: e.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                }))
              }
            />
            <select
              className="border rounded p-2"
              value={form.visibility}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  visibility: e.target.value === "private" ? "private" : "public",
                }))
              }
            >
              <option value="public">Publico</option>
              <option value="private">Privado</option>
            </select>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-indigo-600 text-white" type="submit">
                {editingId ? "Actualizar" : "Crear"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-300"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      title: "",
                      summary: "",
                      body: "",
                      tags: [],
                      visibility: "public",
                    });
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="p-4 border rounded bg-white">
          <h2 className="text-xl font-semibold mb-3">Experiencias ({items.length})</h2>
          {loading && <p>Cargando...</p>}
          {!loading && sortedItems.length === 0 && <p>Aun no hay experiencias.</p>}
          <div className="grid gap-3">
            {sortedItems.map((item) => (
              <article key={item.id} className="p-3 border rounded">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.summary}</p>
                    <p className="text-xs mt-2 text-gray-500">
                      {item.visibility.toUpperCase()} · actualizado {item.updatedAt}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 rounded bg-amber-500 text-white"
                      onClick={() => {
                        setEditingId(item.id);
                        setForm({
                          title: item.title,
                          summary: item.summary,
                          body: item.body,
                          tags: item.tags,
                          visibility: item.visibility,
                        });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-red-600 text-white"
                      onClick={async () => {
                        if (!token) return;
                        setError("");
                        try {
                          await deleteExperience(token, item.id);
                          await refreshItems();
                        } catch (err: unknown) {
                          setError(formatApiError(err, "No se pudo eliminar"));
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="p-4 border rounded bg-white mt-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Observabilidad operativa</h2>
            <button
              type="button"
              className="px-3 py-1 rounded bg-slate-700 text-white text-sm"
              onClick={async () => {
                setError("");
                try {
                  await refreshOps();
                } catch (err: unknown) {
                  setError(formatApiError(err, "No se pudo refrescar observabilidad"));
                }
              }}
            >
              Refrescar
            </button>
          </div>
          {opsLoading && <p className="text-sm text-gray-600">Consultando metricas...</p>}
          {!opsLoading && opsSummary && (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${semaphoreClass(opsSummary.status)}`}>
              Semaforo operativo: {opsSummary.status.toUpperCase()}
            </div>
          )}
          {!opsLoading && opsAlerts && (
            <p className="text-sm mb-2">
              Estado alertas:{" "}
              <span className="font-semibold uppercase">
                {opsAlerts.level}
              </span>
              {opsAlerts.reasons.length > 0 ? ` (${opsAlerts.reasons.join(", ")})` : ""} · scope{" "}
              {opsAlerts.evaluationScope}
            </p>
          )}
          {!opsLoading && opsMetrics && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              <div className="p-2 border rounded">Requests: {opsMetrics.requestsTotal}</div>
              <div className="p-2 border rounded">5xx: {opsMetrics.errors5xx}</div>
              <div className="p-2 border rounded">Auth Failures: {opsMetrics.authFailures}</div>
              <div className="p-2 border rounded">5xx Rate: {(opsMetrics.errorRate * 100).toFixed(2)}%</div>
              <div className="p-2 border rounded">
                Auth Fail Rate: {(opsMetrics.authFailRate * 100).toFixed(2)}%
              </div>
              <div className="p-2 border rounded">
                Started: {new Date(opsMetrics.startedAtUnix * 1000).toLocaleString()}
              </div>
            </div>
          )}
          {!opsLoading && opsMetrics && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm mt-3">
              <div className="p-2 border rounded">Window (s): {opsMetrics.window.seconds}</div>
              <div className="p-2 border rounded">Window Requests: {opsMetrics.window.requests}</div>
              <div className="p-2 border rounded">Window 5xx: {opsMetrics.window.errors5xx}</div>
              <div className="p-2 border rounded">
                Window 5xx Rate: {(opsMetrics.window.errorRate * 100).toFixed(2)}%
              </div>
              <div className="p-2 border rounded">
                Window Auth Fail Rate: {(opsMetrics.window.authFailRate * 100).toFixed(2)}%
              </div>
            </div>
          )}
          {!opsLoading && opsHealth && (
            <div className="mt-3 p-3 border rounded bg-slate-50 text-sm">
              <p className="font-semibold mb-2">Health: {opsHealth.status.toUpperCase()}</p>
              <ul className="list-disc ml-5">
                {opsHealth.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {!opsLoading && opsSummary && (
            <div className="mt-3 p-3 border rounded bg-white text-sm grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="p-2 border rounded">Samples: {opsSummary.samples.count}/{opsSummary.samples.size}</div>
              <div className="p-2 border rounded">OK: {opsSummary.distribution.ok}</div>
              <div className="p-2 border rounded">WARN: {opsSummary.distribution.warn}</div>
              <div className="p-2 border rounded">CRITICAL: {opsSummary.distribution.critical}</div>
              <div className="p-2 border rounded">Avg 5xx: {(opsSummary.averages.errorRate * 100).toFixed(2)}%</div>
              <div className="p-2 border rounded">
                Avg Auth Fail: {(opsSummary.averages.authFailRate * 100).toFixed(2)}%
              </div>
            </div>
          )}
          {!opsLoading && opsHistory.length > 0 && (
            <div className="mt-3 p-3 border rounded bg-white text-sm">
              <p className="font-semibold mb-2">Historial reciente de salud</p>
              <div className="max-h-56 overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="py-1">Timestamp</th>
                      <th className="py-1">Status</th>
                      <th className="py-1">Scope</th>
                      <th className="py-1">5xx%</th>
                      <th className="py-1">Auth%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...opsHistory]
                      .reverse()
                      .slice(0, 20)
                      .map((item) => (
                        <tr key={`${item.timestampUnix}-${item.status}`} className="border-b last:border-b-0">
                          <td className="py-1">{new Date(item.timestampUnix * 1000).toLocaleTimeString()}</td>
                          <td className="py-1 uppercase">{item.status}</td>
                          <td className="py-1">{item.scope}</td>
                          <td className="py-1">{(item.errorRate * 100).toFixed(2)}</td>
                          <td className="py-1">{(item.authFailRate * 100).toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
