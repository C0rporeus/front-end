import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import {
  createExperience,
  deleteExperience,
  listPrivateExperiences,
  updateExperience,
} from "@/api/experiences";
import { useAuth } from "@/context/auth-context";
import { Experience, ExperiencePayload } from "@/interfaces/Experience";

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, logout, token } = useAuth();
  const [items, setItems] = useState<Experience[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace("/auth/login");
      return;
    }

    refreshItems()
      .catch((err: any) => setError(err.message || "No se pudo cargar el contenido"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, router, token, refreshItems]);

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
    } catch (err: any) {
      setError(err.message || "No fue posible guardar");
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
                        } catch (err: any) {
                          setError(err.message || "No se pudo eliminar");
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
      </main>
    </>
  );
}
