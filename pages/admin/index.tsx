import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";

import { useAuth } from "@/context/auth-context";

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

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
            Esta primera version deja listo el contexto privado y la base de autenticacion para crecer.
          </p>
        </section>
      </main>
    </>
  );
}
