import Head from "next/head";

const posts = [
  {
    title: "Diseño de APIs limpias para portafolios tecnicos",
    excerpt: "Buenas practicas para contratos simples, versionables y faciles de mantener.",
  },
  {
    title: "Autenticacion JWT: errores comunes en proyectos personales",
    excerpt: "Lecciones reales para evitar deuda tecnica temprana en auth y sesiones.",
  },
];

export default function BlogPage() {
  return (
    <>
      <Head>
        <title>Blog | Portfolio Dev</title>
      </Head>
      <main className="max-w-4xl mx-auto py-12 px-4 text-gray-800">
        <h1 className="text-3xl font-bold mb-6">Blog tecnico</h1>
        <div className="grid gap-4">
          {posts.map((post) => (
            <article key={post.title} className="p-4 bg-white border rounded">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p>{post.excerpt}</p>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
