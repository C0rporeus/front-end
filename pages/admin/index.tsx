import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

const RichTextEditor = dynamic(
  () => import("@/components/UI/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[160px] items-center justify-center rounded border border-slate-600 bg-surface-900/85">
        <p className="text-sm text-text-muted">Cargando editor...</p>
      </div>
    ),
  }
);

import {
  createExperience,
  deleteExperience,
  listPrivateExperiences,
  updateExperience,
} from "@/api/experiences";
import { createSkill, deleteSkill, updateSkill } from "@/api/skills";
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
import LandingHeader from "@/components/layout/landing/LandingHeader";
import { useAuth } from "@/context/auth-context";
import { Experience, ExperiencePayload } from "@/interfaces/Experience";
import { formatApiError } from "@/utils/format-api-error";
import ErrorAlert from "@/components/UI/ErrorAlert";
import { uploadImageWithPreview } from "@/api/upload";
import { countImagesInHtml } from "@/utils/html-content";
import { filterAdminContent } from "@/utils/admin-content";
import { CONTENT_KIND_LABELS, resolveContentKind } from "@/utils/content-kind";

type AdminView = "blog" | "experiences" | "skills" | "portfolio" | "ops";

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => normalizeTag(tag))
    .filter(Boolean);
}

function parseImageURLs(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((url) => url.trim())
    .filter(Boolean);
}

/** Quita la firma temporal de una URL de GCS; la API entrega URLs firmadas en lectura. */
function toCanonicalImageURL(url: string): string {
  return url.includes("X-Goog-Signature") ? url.split("?")[0] : url;
}

function resolveAdminView(value: string | undefined): AdminView {
  if (
    value === "blog" ||
    value === "experiences" ||
    value === "skills" ||
    value === "portfolio" ||
    value === "ops"
  ) {
    return value;
  }
  return "experiences";
}

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthReady, logout, token } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
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
  const [tagsInput, setTagsInput] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState("");
  // URL canónica (persistida) -> URL firmada para renderizar; el bucket es privado.
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const [form, setForm] = useState<ExperiencePayload>({
    title: "",
    summary: "",
    body: "",
    imageUrls: [],
    tags: [],
    visibility: "public",
  });
  const viewParam = Array.isArray(router.query.view) ? router.query.view[0] : router.query.view;
  const activeView = useMemo(() => resolveAdminView(viewParam), [viewParam]);
  const isContentView = activeView !== "ops";
  const isEditingBlogEntry = activeView === "blog" && editingId !== null;

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [items]
  );
  const filteredItems = useMemo(() => filterAdminContent(sortedItems, activeView), [activeView, sortedItems]);

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

  const clearContentForm = () => {
    setForm({
      title: "",
      summary: "",
      body: "",
      imageUrls: [],
      tags: [],
      visibility: "public",
    });
    setTagsInput("");
    setImagePreviews({});
  };

  const cancelEditing = () => {
    setEditingId(null);
    clearContentForm();
    setUploadError("");
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !isAuthReady) return;

    if (!isAuthenticated || !token) {
      router.replace("/auth/login");
      return;
    }

    refreshItems()
      .catch((err: unknown) => setError(formatApiError(err, "No se pudo cargar el contenido")))
      .finally(() => setLoading(false));

    refreshOps().catch((err: unknown) => setError(formatApiError(err, "No se pudo cargar observabilidad")));
  }, [isHydrated, isAuthReady, isAuthenticated, router, token, refreshItems, refreshOps]);

  if (!isHydrated || !isAuthReady || !isAuthenticated) {
    return null;
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !isContentView) return;
    setError("");
    try {
      const contextTag =
        activeView === "blog"
          ? "blog"
          : activeView === "portfolio"
            ? "portfolio"
            : activeView === "skills"
              ? "skill"
              : null;
      const parsedTags = parseTags(tagsInput);
      const payload: ExperiencePayload = {
        ...form,
        tags: contextTag
          ? Array.from(new Set([...parsedTags, contextTag].map(normalizeTag)))
          : parsedTags,
      };
      if (editingId && activeView === "skills") {
        await updateSkill(token, editingId, payload);
      } else if (editingId) {
        await updateExperience(token, editingId, payload);
      } else if (activeView === "skills") {
        await createSkill(token, payload);
      } else {
        await createExperience(token, payload);
      }
      clearContentForm();
      setEditingId(null);
      await refreshItems();
    } catch (err: unknown) {
      setError(formatApiError(err, "No fue posible guardar"));
    }
  };

  const removeImageUrl = (index: number) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const onUploadImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !token) return;
    const captured = Array.from(files);
    event.target.value = "";
    setUploadError("");
    setUploadingImages(true);
    try {
      const uploaded = await Promise.all(captured.map((file) => uploadImageWithPreview(file)));
      setImagePreviews((previous) => ({
        ...previous,
        ...Object.fromEntries(uploaded.map(({ url, previewUrl }) => [url, previewUrl])),
      }));
      setForm((previous) => ({
        ...previous,
        imageUrls: Array.from(new Set([...previous.imageUrls, ...uploaded.map(({ url }) => url)])),
      }));
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error
          ? err.message
          : "No fue posible subir las imágenes.",
      );
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin | Portfolio Dev</title>
      </Head>
      <LandingHeader
        mode="private"
        onPrivateLogout={() => {
          logout();
          router.push("/");
        }}
      />
      <main className={`mx-auto px-4 pb-10 pt-[98px] text-text-primary md:px-8 md:pt-[108px] ${isEditingBlogEntry ? "max-w-7xl" : "max-w-5xl"}`}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Panel privado del portafolio</h1>
          <p className="mt-2 text-text-secondary">
            Vista activa:{" "}
            <span className="font-semibold text-text-primary">
              {activeView === "blog"
                ? "Artículos del blog"
                : activeView === "skills"
                  ? "Capacidades clave"
                : activeView === "portfolio"
                  ? "Muestras de portafolio"
                  : activeView === "ops"
                    ? "Operaciones"
                    : "Experiencias"}
            </span>
          </p>
        </div>

        <section className="mb-4 rounded-xl border border-slate-700 bg-surface-800/65 p-4">
          <h2 className="text-xl font-semibold mb-2">Contenido profesional</h2>
          <p className="text-text-secondary">
            Gestiona contenido por contexto privado: blog, capacidades, experiencias y portafolio en vistas independientes.
          </p>
        </section>

        {error && <ErrorAlert message={error} />}

        {isContentView && (
          <section className="mb-4 rounded-xl border border-slate-700 bg-surface-800/65 p-4">
            <h2 className="text-xl font-semibold mb-4">
              {editingId
                ? "Editar entrada"
                : activeView === "blog"
                  ? "Nuevo artículo"
                  : activeView === "skills"
                    ? "Nueva capacidad"
                  : activeView === "portfolio"
                    ? "Nueva muestra de portafolio"
                    : "Nueva experiencia"}
            </h2>
            <form className={isEditingBlogEntry ? "admin-blog-edit-form" : "grid gap-3"} onSubmit={onSubmit}>
              {isEditingBlogEntry && (
                <div className="admin-blog-edit-actions">
                  <div className="min-w-0">
                    <span className="block text-xs uppercase tracking-[0.12em] text-text-muted">Edición en curso</span>
                    <span className="block truncate font-medium">{form.title || "Artículo sin título"}</span>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500" type="submit">
                      Actualizar
                    </button>
                    <button
                      type="button"
                      className="rounded bg-slate-600 px-4 py-2 text-white hover:bg-slate-500"
                      onClick={cancelEditing}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              <div className={isEditingBlogEntry ? "admin-blog-edit-main" : "contents"}>
              <input
                className="rounded border border-slate-600 bg-surface-900/85 p-2 text-text-primary"
                placeholder={
                  activeView === "blog"
                    ? "Título del artículo"
                    : activeView === "skills"
                      ? "Título de la capacidad"
                    : activeView === "portfolio"
                      ? "Título de la muestra"
                      : "Título de la experiencia"
                }
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
              <input
                className="rounded border border-slate-600 bg-surface-900/85 p-2 text-text-primary"
                placeholder="Resumen ejecutivo"
                value={form.summary}
                onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
              />
              <div className={isEditingBlogEntry ? "admin-blog-edit-richtext" : "contents"}>
                <RichTextEditor
                  value={form.body}
                  onChange={(html) => setForm((prev) => ({ ...prev, body: html }))}
                  placeholder={
                    activeView === "blog"
                      ? "Contenido del artículo"
                      : activeView === "skills"
                        ? "Detalle de la capacidad, stack o nivel"
                      : activeView === "portfolio"
                        ? "Descripción de la muestra y resultado"
                        : "Detalle técnico y resultados"
                  }
                  onUploadImage={
                    token ? async (file) => (await uploadImageWithPreview(file)).previewUrl : undefined
                  }
                />
              </div>
              </div>
              <div
                className={isEditingBlogEntry ? "admin-blog-edit-sidebar" : "contents"}
                role={isEditingBlogEntry ? "complementary" : undefined}
                aria-label={isEditingBlogEntry ? "Metadatos del artículo" : undefined}
              >
              {isEditingBlogEntry && (
                <div className="admin-blog-edit-sidebar-heading">
                  <h3 className="font-semibold">Detalles de publicación</h3>
                  <p className="text-xs text-text-muted">Imágenes, etiquetas y visibilidad</p>
                </div>
              )}
              <textarea
                className="rounded border border-slate-600 bg-surface-900/85 p-2 text-text-primary"
                rows={isEditingBlogEntry ? 2 : 3}
                aria-label="URLs de imagen"
                placeholder="URLs de imagen (separadas por coma o salto de línea)"
                value={form.imageUrls.join("\n")}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    imageUrls: parseImageURLs(e.target.value),
                  }))
                }
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted">Subir imágenes desde archivo</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploadingImages}
                  className="rounded border border-dashed border-slate-500 bg-surface-900/65 p-2 text-sm text-text-secondary file:mr-3 file:rounded file:border-0 file:bg-brand-600/35 file:px-3 file:py-1 file:text-text-primary hover:border-brand-400/65 disabled:opacity-60"
                  onChange={onUploadImages}
                />
                {uploadingImages && (
                  <p className="text-sm text-text-muted">Subiendo imágenes…</p>
                )}
                {uploadError && (
                  <p className="text-sm text-red-400">{uploadError}</p>
                )}
              </div>
              {form.imageUrls.length > 0 && (
                <div className="admin-blog-edit-image-grid grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {form.imageUrls.map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} className="relative overflow-hidden rounded border border-slate-700/80 group">
                      <Image
                        src={imagePreviews[imageUrl] ?? imageUrl}
                        alt={`Vista previa ${index + 1}`}
                        className="h-24 w-full object-cover"
                        width={160}
                        height={96}
                        unoptimized
                      />
                      <button
                        type="button"
                        aria-label="Eliminar imagen"
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                        onClick={() => removeImageUrl(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                className="rounded border border-slate-600 bg-surface-900/85 p-2 text-text-primary"
                placeholder="Tags separados por coma"
                aria-label="Tags separados por coma"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              <select
                className="rounded border border-slate-600 bg-surface-900/85 p-2 text-text-primary"
                value={form.visibility}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    visibility: e.target.value === "private" ? "private" : "public",
                  }))
                }
              >
                <option value="public">Público</option>
                <option value="private">Privado</option>
              </select>
              {!isEditingBlogEntry && (
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded bg-indigo-600 text-white" type="submit">
                  {editingId ? "Actualizar" : "Crear"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="rounded bg-slate-600 px-4 py-2 text-white hover:bg-slate-500"
                    onClick={cancelEditing}
                  >
                    Cancelar
                  </button>
                )}
              </div>
              )}
              </div>
            </form>
          </section>
        )}

        {isContentView && (
          <section className="rounded-xl border border-slate-700 bg-surface-800/65 p-4">
            <h2 className="text-xl font-semibold mb-3">
              {activeView === "blog"
                ? `Artículos publicados (${filteredItems.length})`
                : activeView === "skills"
                  ? `Capacidades publicadas (${filteredItems.length})`
                : activeView === "portfolio"
                  ? `Muestras publicadas (${filteredItems.length})`
                  : `Experiencias publicadas (${filteredItems.length})`}
            </h2>
            {loading && <p className="text-text-secondary">Cargando...</p>}
            {!loading && filteredItems.length === 0 && (
              <p className="text-text-secondary">Aún no hay contenido registrado en esta vista.</p>
            )}
            <div className="grid gap-3">
              {filteredItems.map((item) => {
                const isBlogItem = activeView === "blog";
                const previewImage = item.imageUrls?.find((url) => url.trim().length > 0);
                const imageCount = (item.imageUrls?.length ?? 0) + countImagesInHtml(item.body ?? "");

                return (
                  <article
                    key={item.id}
                    className={isBlogItem ? "admin-blog-record-card" : "admin-experience-record-card"}
                  >
                    {isBlogItem && (
                      <div className="admin-blog-record-mark" aria-hidden="true">
                        {previewImage ? (
                          <Image src={previewImage} alt="" width={128} height={96} unoptimized />
                        ) : (
                          <span>ARTÍCULO</span>
                        )}
                      </div>
                    )}
                    <div className="admin-content-record-copy">
                      <span className="admin-content-record-kind">
                        {CONTENT_KIND_LABELS[resolveContentKind(item)]}
                      </span>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-text-secondary">{item.summary}</p>
                      {isBlogItem && item.tags.length > 0 && (
                        <div className="admin-content-record-tags">
                          {item.tags.filter((tag) => tag !== "blog").slice(0, 6).map((tag) => (
                            <span key={`${item.id}-${tag}`}>#{tag}</span>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-xs text-text-muted">
                        {item.visibility.toUpperCase()} · actualizado {item.updatedAt}
                      </p>
                      {!isBlogItem && (
                        <p className="mt-1 text-xs text-text-muted">
                          Imágenes: {imageCount}
                          {(item.imageUrls?.length ?? 0) === 0 && countImagesInHtml(item.body ?? "") > 0 && (
                            <span className="ml-1 text-text-muted opacity-70">(en contenido)</span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="admin-content-record-actions">
                      <button
                        type="button"
                        className="rounded bg-amber-500 px-2 py-1 text-white hover:bg-amber-400"
                        onClick={() => {
                          const signedImageUrls = item.imageUrls ?? [];
                          setEditingId(item.id);
                          setImagePreviews(
                            Object.fromEntries(signedImageUrls.map((url) => [toCanonicalImageURL(url), url])),
                          );
                          setForm({
                            title: item.title,
                            summary: item.summary,
                            body: item.body,
                            imageUrls: signedImageUrls.map(toCanonicalImageURL),
                            tags: item.tags,
                            visibility: item.visibility,
                          });
                          setTagsInput(item.tags.join(", "));
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-500"
                        onClick={async () => {
                          if (!token || !window.confirm(`¿Eliminar “${item.title}”? Esta acción no se puede deshacer.`)) return;
                          setError("");
                          try {
                            if (activeView === "skills") {
                              await deleteSkill(token, item.id);
                            } else {
                              await deleteExperience(token, item.id);
                            }
                            await refreshItems();
                          } catch (err: unknown) {
                            setError(formatApiError(err, "No se pudo eliminar"));
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-4 rounded-xl border border-slate-700 bg-surface-800/65 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Resumen de observabilidad</h2>
            <button
              type="button"
              className="rounded bg-slate-700 px-3 py-1 text-sm text-white hover:bg-slate-600"
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
          {activeView !== "ops" && (
            <p className="mb-2 text-sm text-text-muted">
              Esta sección corresponde a la vista privada de operaciones.
            </p>
          )}
          {opsLoading && <p className="text-sm text-text-secondary">Consultando métricas...</p>}
          {!opsLoading && opsSummary && (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${semaphoreClass(opsSummary.status)}`}>
              Semaforo operativo: {opsSummary.status.toUpperCase()}
            </div>
          )}
          {!opsLoading && opsAlerts && (
            <p className="mb-2 text-sm text-text-secondary">
              Estado alertas:{" "}
              <span className="font-semibold uppercase">
                {opsAlerts.level}
              </span>
              {opsAlerts.reasons.length > 0 ? ` (${opsAlerts.reasons.join(", ")})` : ""} · scope{" "}
              {opsAlerts.evaluationScope}
            </p>
          )}
          {!opsLoading && opsMetrics && (
            <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded border border-slate-700 p-2">Requests: {opsMetrics.requestsTotal}</div>
              <div className="rounded border border-slate-700 p-2">5xx: {opsMetrics.errors5xx}</div>
              <div className="rounded border border-slate-700 p-2">Auth Failures: {opsMetrics.authFailures}</div>
              <div className="rounded border border-slate-700 p-2">5xx Rate: {(opsMetrics.errorRate * 100).toFixed(2)}%</div>
              <div className="rounded border border-slate-700 p-2">
                Auth Fail Rate: {(opsMetrics.authFailRate * 100).toFixed(2)}%
              </div>
              <div className="rounded border border-slate-700 p-2">
                Started: {new Date(opsMetrics.startedAtUnix * 1000).toLocaleString()}
              </div>
            </div>
          )}
          {!opsLoading && opsMetrics && (
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded border border-slate-700 p-2">Window (s): {opsMetrics.window.seconds}</div>
              <div className="rounded border border-slate-700 p-2">Window Requests: {opsMetrics.window.requests}</div>
              <div className="rounded border border-slate-700 p-2">Window 5xx: {opsMetrics.window.errors5xx}</div>
              <div className="rounded border border-slate-700 p-2">
                Window 5xx Rate: {(opsMetrics.window.errorRate * 100).toFixed(2)}%
              </div>
              <div className="rounded border border-slate-700 p-2">
                Window Auth Fail Rate: {(opsMetrics.window.authFailRate * 100).toFixed(2)}%
              </div>
            </div>
          )}
          {!opsLoading && opsHealth && (
            <div className="mt-3 rounded border border-slate-700 bg-surface-900/70 p-3 text-sm">
              <p className="font-semibold mb-2">Health: {opsHealth.status.toUpperCase()}</p>
              <ul className="list-disc ml-5">
                {opsHealth.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {!opsLoading && opsSummary && (
            <div className="mt-3 grid gap-2 rounded border border-slate-700 bg-surface-900/70 p-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded border border-slate-700 p-2">Samples: {opsSummary.samples.count}/{opsSummary.samples.size}</div>
              <div className="rounded border border-slate-700 p-2">OK: {opsSummary.distribution.ok}</div>
              <div className="rounded border border-slate-700 p-2">WARN: {opsSummary.distribution.warn}</div>
              <div className="rounded border border-slate-700 p-2">CRITICAL: {opsSummary.distribution.critical}</div>
              <div className="rounded border border-slate-700 p-2">Avg 5xx: {(opsSummary.averages.errorRate * 100).toFixed(2)}%</div>
              <div className="rounded border border-slate-700 p-2">
                Avg Auth Fail: {(opsSummary.averages.authFailRate * 100).toFixed(2)}%
              </div>
            </div>
          )}
          {!opsLoading && opsHistory.length > 0 && (
            <div className="mt-3 rounded border border-slate-700 bg-surface-900/70 p-3 text-sm">
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
                      .map((item, idx) => (
                        <tr key={`${item.timestampUnix}-${item.status}-${idx}`} className="border-b last:border-b-0">
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
