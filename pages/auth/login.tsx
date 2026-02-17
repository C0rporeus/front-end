// pagina de login limpia sin cabecera o footer debe usar los componentes de tailwind js y micro acciones

import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

import { loginUser } from "@/api/auth/auth";
import ErrorAlert from "@/components/UI/ErrorAlert";
import { useAuth } from "@/context/auth-context";
import { formatApiError } from "@/utils/format-api-error";

const Login = () => {
  const router = useRouter();
  const { setTokenValue } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    try {
      const result = await loginUser({
        email,
        password,
      });
      setTokenValue(result.token);
      router.push("/admin");
    } catch (submitError: unknown) {
      setError(formatApiError(submitError, "No fue posible iniciar sesion"));
    }
  }

  return (
    <>
      <Head>
        <title>Ingreso | Portfolio Dev</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <section className="w-full max-w-xl rounded-3xl border border-slate-700/85 bg-surface-800/72 p-6 shadow-card backdrop-blur-sm md:p-8">
          <h1 className="text-center text-4xl font-extrabold tracking-tight text-text-primary md:text-5xl">
            Iniciar sesion
          </h1>
          <p className="mx-auto mt-3 max-w-md text-center text-base leading-7 text-text-secondary">
            Accede a tu panel privado o{" "}
            <Link href="/auth/register" className="font-medium text-brand-400 hover:text-brand-500">
              crea una cuenta
            </Link>
            .
          </p>

          <form className="mx-auto mt-8 max-w-lg space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="mb-2 block text-base font-medium text-text-secondary">
                Correo electronico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block min-h-12 w-full rounded-lg border border-slate-600/90 bg-surface-900/90 px-4 py-3 text-lg text-text-primary placeholder:text-text-muted focus:border-brand-400/80"
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-base font-medium text-text-secondary">
                Contrasena
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block min-h-12 w-full rounded-lg border border-slate-600/90 bg-surface-900/90 px-4 py-3 text-lg text-text-primary placeholder:text-text-muted focus:border-brand-400/80"
                placeholder="Tu contrasena"
              />
            </div>

            {error && (
              <ErrorAlert message={error} className="text-sm" />
            )}

            <button
              type="submit"
              className="mt-1 min-h-12 w-full rounded-lg bg-brand-600 px-5 py-3 text-base font-semibold text-white shadow-soft hover:bg-brand-500"
            >
              Ingresar al panel
            </button>
          </form>
        </section>
      </main>
    </>
  );
};

export default Login;