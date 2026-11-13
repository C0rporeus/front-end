import PageSeo from "@/components/seo/PageSeo";
import LandingHeader from "@/components/layout/landing/LandingHeader";

export default function About() {
  return (
    <>
      <PageSeo
        title="Sobre mí | Yonathan Gutierrez"
        description="Perfil profesional de Yonathan Gutierrez R: consultoría tecnológica, desarrollo de productos digitales, arquitectura, infraestructura y seguridad."
        path="/about/"
        type="profile"
      />
      <LandingHeader />
      <main className="public-main pt-[96px] md:pt-[104px]">
        <section className="public-page-shell mx-auto w-full max-w-4xl">
          <h1 className="public-title">Sobre mí</h1>
          <p className="public-lead">
            Soy Yonathan Gutierrez R., consultor tecnológico enfocado en crear y
            mejorar productos digitales con una mirada práctica de negocio, calidad
            técnica y sostenibilidad operativa.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-text-secondary">
            Trabajo en la intersección entre desarrollo de software, arquitectura,
            infraestructura y seguridad para convertir necesidades reales en soluciones
            claras, mantenibles y con impacto medible.
          </p>
        </section>

        <section className="public-card mx-auto mt-8 w-full max-w-4xl">
          <h2 className="text-xl font-semibold text-text-primary">Cómo trabajo</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
            <li>Priorizo entender el contexto y los objetivos antes de proponer tecnología.</li>
            <li>Busco decisiones técnicas simples, trazables y alineadas al ritmo del equipo.</li>
            <li>Cuido la calidad con foco en observabilidad, seguridad y mantenibilidad.</li>
            <li>Combino ejecución técnica con comunicación clara para avanzar sin fricción.</li>
          </ul>
        </section>

        <section className="public-card mx-auto mt-4 w-full max-w-4xl">
          <h2 className="text-xl font-semibold text-text-primary">Áreas de especialidad</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <article className="rounded border border-slate-700 bg-surface-950 p-4">
              <h3 className="text-sm font-semibold text-text-primary">Productos digitales</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Diseño y desarrollo de funcionalidades orientadas a valor, desde discovery
                hasta entrega continua.
              </p>
            </article>
            <article className="rounded border border-slate-700 bg-surface-950 p-4">
              <h3 className="text-sm font-semibold text-text-primary">Arquitectura e infraestructura</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Estructura de soluciones web y plataformas con foco en performance,
                escalabilidad y operación estable.
              </p>
            </article>
            <article className="rounded border border-slate-700 bg-surface-950 p-4">
              <h3 className="text-sm font-semibold text-text-primary">Seguridad y operación</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Buenas prácticas de seguridad aplicada, monitoreo y mejora continua para
                reducir riesgo técnico.
              </p>
            </article>
          </div>
        </section>

        <section className="mx-auto mb-6 mt-8 w-full max-w-4xl">
          <p className="text-sm leading-6 text-text-secondary">
            Si quieres, puedes revisar más detalles de mi trayectoria en LinkedIn o escribirme
            desde el formulario de contacto para conversar sobre tu contexto.
          </p>
          <a
            href="https://www.linkedin.com/in/yonathan-gutierrez-rodriguez-742a32bb/"
            target="_blank"
            rel="noreferrer"
            className="route-link mt-2"
          >
            Ver perfil en LinkedIn
          </a>
        </section>
      </main>
    </>
  );
}
