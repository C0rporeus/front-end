// Vista de registro de usuarios conectada con el método registerUser de api/auth.

import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

import { registerUser } from "@/api/auth/auth";
import ErrorAlert from "@/components/UI/ErrorAlert";
import { useAuth } from "@/context/auth-context";
import { formatApiError } from "@/utils/format-api-error";
import { isValidPassword, isValidEmail } from "@/utils/input-validation";

const Register = () => {
  const router = useRouter();
  const { setTokenValue } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email.trim())) {
      setError("El formato del correo electrónico no es válido.");
      return;
    }
    if (!isValidPassword(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.");
      return;
    }

    try {
      const result = await registerUser({
        email,
        password,
      });
      setTokenValue(result.authenticated ? "cookie-session" : null);
      router.push("/admin");
    } catch (submitError: unknown) {
      setError(formatApiError(submitError, "No fue posible registrar el usuario"));
    }
  }

  return (
    <>
      <Head>
        <title>Registro | Portfolio Dev</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-surface-800/75 p-6 shadow-soft">
          <h1 className="text-center text-3xl font-extrabold text-text-primary">Crear cuenta</h1>
          <p className="mt-2 text-center text-sm text-text-secondary">
            ¿Ya tienes acceso?{" "}
            <Link href="/auth/login" className="font-medium text-brand-400 hover:text-brand-500">
              Inicia sesión aquí
            </Link>
            .
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="mb-1 block text-sm text-text-secondary">
                Correo electrónico
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
                className="block w-full rounded-md border border-slate-600 bg-surface-900/85 px-3 py-2 text-text-primary placeholder:text-text-muted"
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-text-secondary">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-slate-600 bg-surface-900/85 px-3 py-2 text-text-primary placeholder:text-text-muted"
                placeholder="Mín. 8 caracteres: mayúscula, minúscula y número"
              />
            </div>
            {error && (
              <ErrorAlert message={error} className="text-sm" />
            )}
            <button
              type="submit"
              className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
            >
              Crear cuenta y continuar
            </button>
          </form>
        </section>
      </main>
    </>
  );
};

export default Register;
