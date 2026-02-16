import Head from "next/head";
import LandingHeader from "@/components/layout/landing/LandingHeader";

export default function About() {
  return (
    <>
      <Head>
        <title>Sobre mi | Portfolio Dev</title>
      </Head>
      <LandingHeader />
      <main className="public-main pt-[96px] md:pt-[104px]">
        <section className="public-page-shell mx-auto w-full max-w-4xl">
          <h1 className="public-title">Sobre mi</h1>
          <p className="public-lead">
            Este espacio resume mi enfoque de trabajo en desarrollo de software,
            arquitectura de soluciones e infraestructura con criterios de seguridad.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-text-secondary">
            El objetivo es compartir evidencia tecnica util, aprendizajes aplicables y
            proyectos construidos para resolver necesidades reales de negocio.
          </p>
        </section>
      </main>
    </>
  );
}
