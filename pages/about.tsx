import Head from "next/head";

export default function About() {
  return (
    <>
      <Head>
        <title>Acerca de | Portfolio Dev</title>
      </Head>
      <main className="max-w-4xl mx-auto py-12 px-4 text-gray-800">
        <h1 className="text-3xl font-bold mb-4">Acerca de mi</h1>
        <p className="mb-4">
          Espacio profesional para compartir experiencia en desarrollo de software, arquitectura,
          seguridad e infraestructura.
        </p>
        <p>
          El objetivo de este portafolio es mostrar evidencia real de trabajo tecnico, herramientas
          utiles para pares y una ruta de crecimiento sostenida en el tiempo.
        </p>
      </main>
    </>
  );
}
