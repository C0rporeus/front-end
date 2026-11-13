import Head from "next/head";
import Link from "next/link";
import LandingHeader from "../components/layout/landing/LandingHeader";

const Custom404 = () => {
  return (
    <div className="flex min-h-screen flex-col text-text-primary">
      <Head>
        <title>404 - Página no encontrada | Yonathan Gutierrez R</title>
        <meta name="description" content="La página que buscas no existe o ha sido movida." />
        <meta name="robots" content="noindex, follow" />
      </Head>

      <LandingHeader />

      <main className="public-main flex flex-grow flex-col justify-center pt-[96px]">
        <div className="public-page-shell max-w-2xl">
          <p className="data-text">404 · ruta sin salida</p>
          <h1 className="public-title mt-3">Esta ruta no llega a ningún bloque.</h1>
          <p className="public-lead">
            La página no existe o cambió de sitio. Desde el inicio se llega a todo lo demás.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="pushbutton pushbutton-primary">
              <span className="lamp" aria-hidden="true" />
              Volver al inicio
            </Link>
            <Link href="/portfolio" className="pushbutton">
              <span className="lamp" aria-hidden="true" />
              Ver portafolio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Custom404;
