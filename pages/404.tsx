import Head from "next/head";
import Link from "next/link";
import LandingHeader from "../components/layout/landing/LandingHeader";

const Custom404 = () => {
  return (
    <div className="flex min-h-screen flex-col text-text-primary">
      <Head>
        <title>404 - Pagina no encontrada | Yonathan Gutierrez R</title>
        <meta name="description" content="La pagina que buscas no existe o ha sido movida." />
        <meta name="robots" content="noindex, follow" />
      </Head>

      <LandingHeader />

      <main className="flex flex-grow flex-col items-center justify-center px-4 text-center pt-[72px]">
        <div className="max-w-2xl">
          <h1 className="mb-4 text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-brand-400 to-indigo-500 md:text-9xl drop-shadow-sm select-none">
            404
          </h1>
          
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-text-primary md:text-4xl">
            ¡Ups! Te has desviado del camino
          </h2>
          
          <p className="mb-10 text-base text-text-secondary md:text-lg">
            La pagina que intentas visitar no existe o ha sido movida a otra dimension. 
            No te preocupes, puedes volver al inicio y seguir explorando.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link 
              href="/"
              className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-500 active:scale-[0.98] sm:w-auto"
            >
              Volver al inicio
            </Link>
            <Link 
              href="/portfolio"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-700 bg-surface-800 px-8 py-3.5 text-sm font-semibold text-text-primary transition-all hover:bg-surface-700 active:scale-[0.98] sm:w-auto"
            >
              Ver portafolio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Custom404;
