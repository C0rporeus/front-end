import Head from "next/head";
import { useEffect, useState } from "react";

import { listPublicExperiences } from "@/api/experiences";
import { Experience } from "@/interfaces/Experience";

export default function PortfolioPage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPublicExperiences()
      .then((data) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Head>
        <title>Portafolio | Portfolio Dev</title>
      </Head>
      <main className="max-w-4xl mx-auto py-12 px-4 text-gray-800">
        <h1 className="text-3xl font-bold mb-6">Portafolio y experiencia</h1>
        {loading && <p>Cargando experiencias...</p>}
        {!loading && items.length === 0 && (
          <p className="text-gray-600">
            Aun no hay experiencias publicadas. Puedes agregarlas desde el panel admin.
          </p>
        )}
        <div className="grid gap-4">
          {items.map((item) => (
            <article key={item.id} className="p-4 bg-white border rounded">
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
              <p className="mb-2">{item.summary}</p>
              <p className="text-sm text-gray-600">{item.body}</p>
              {item.tags.length > 0 && (
                <p className="text-xs text-gray-500 mt-3">Tags: {item.tags.join(", ")}</p>
              )}
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
