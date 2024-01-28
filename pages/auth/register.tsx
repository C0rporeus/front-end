// vista de registro de usuarios usando el conector en la caprta api/auth.tsx el metodo registerUser

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

import { registerUser } from "@/api/auth";

const Register = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(e: any) {
        e.preventDefault();
        const user = await registerUser({
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
                            Registrarse
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            O{" "}
                            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                iniciar sesión
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
        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
        placeholder="Email address"
        />
        </div> */}
                            <div>
                                <label htmlFor="email-address" className="sr-only">
                                    Correo electrónico
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
                            </div>
                            {/* <div>
        <label htmlFor="password" className="sr-only">
        Password
        </label>
        <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required

        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
        placeholder="Password"
        />

        </div> */}
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Contraseña
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
                                    placeholder="Contraseña"
                                />
                            </div>
                        </div>

                        {/* <div className="flex items-center justify-between">
        <div className="flex items-center">
        <input
        id="remember_me"
        name="remember_me"

        type="checkbox"
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label
        htmlFor="remember_me"
        className="ml-2 block text-sm text-gray-900"
        >
        Remember me
        </label>
        </div>

        <div className="text-sm">
        <a
        href="#"
        className="font-medium text-indigo-600 hover:text-indigo-500"
        >
        Forgot your password?
        </a>
        </div>

        </div> */}
                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"

                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    {/* <!-- Heroicon name: lock-closed --> */}
                                    <svg
                                        className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 12a2 2 0 100-4 2 2 0 000 4z"
                                        />
                                        <path
                                            fillRule="evenodd"
                                            d="M3 4a3 3 0 00-3 3v6a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3H3zm0 2h14a1 1 0
        011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0
        011-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </span>
                                Registrarse
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Register;
