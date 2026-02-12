import Head from "next/head";

const experiences = [
  {
    title: "Plataformas web y API",
    description:
      "Diseno e implementacion de servicios backend y frontends orientados a performance y mantenibilidad.",
  },
  {
    title: "Seguridad aplicada",
    description:
      "Integracion de controles de autenticacion/autorizacion, cifrado y buenas practicas de hardening.",
  },
  {
    title: "Infraestructura y automatizacion",
    description:
      "Uso de herramientas cloud y pipelines para despliegues mas estables y repetibles.",
  },
];

export default function PortfolioPage() {
  return (
    <>
      <Head>
        <title>Portafolio | Portfolio Dev</title>
      </Head>
      <main className="max-w-4xl mx-auto py-12 px-4 text-gray-800">
        <h1 className="text-3xl font-bold mb-6">Portafolio y experiencia</h1>
        <div className="grid gap-4">
          {experiences.map((item) => (
            <article key={item.title} className="p-4 bg-white border rounded">
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
