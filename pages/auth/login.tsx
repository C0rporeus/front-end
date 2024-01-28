// pagina de login limpia sin cabecera o footer debe usar los componentes de tailwind js y micro acciones

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

import { loginUser } from "@/api/auth";

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(e: any) {
        e.preventDefault();
        const user = await loginUser({
            email,
            password,
        });
        if (user) {
            router.push("/admin");
        }
    }

    return (
        <><Head>
            <title>Yonathan Gutierrez R / Consultor TI</title>
            <link rel="icon" href="/favicon.ico" />
        </Head><div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                {/* <div className="max-w-md w-full space-y-8"> */}
                <div className="max-w-md w-full">
                    <div>
                        {/* <img
    className="mx-auto h-12 w-auto"
    src="/images/logo.png"
    alt="Workflow"
    /> */}
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Iniciar sesión
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            O{" "}
                            <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                                registrarse
                            </Link>
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <input type="hidden" name="remember" defaultValue="true" />
                        <div className="rounded-md shadow-sm -space-y-px">
                            {/* <div>
        <label htmlFor="email-address" className="sr-only">
        Email address
        </label>
        <input
        id="email-address"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
        placeholder="Correo electrónico"
        />
    </div> */}
                            <div>
                                <label htmlFor="email-address" className="sr-only">
                                    Email address
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Correo electrónico" />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Contraseña" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember_me"
                                    name="remember_me"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                                <label
                                    htmlFor="remember_me"
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    Recordarme
                                </label>
                            </div>
                        </div>
                    </form>
                    <div>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                {/* <LockClosedIcon
    className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
    aria-hidden="true"
    /> */}
                            </span>
                            Iniciar sesión
                        </button>
                    </div>
                </div>
            </div></>
    );
}

export default Login;