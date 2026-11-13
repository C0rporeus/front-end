import Link from "next/link";
import React, { useCallback, useState } from "react";
import { submitContact } from "@/api/contact";
import { ApiClientError } from "@/api/http-client";
import { useInView } from "@/components/UI/useInView";

type FooterProps = {
  ContactForm: React.ComponentType<{ onSubmit: (name: string, email: string, message: string) => void }>;
};

type ContactStatus = "idle" | "sending" | "sent" | "error";

const STATUS_LAMP: Record<ContactStatus, string> = {
  idle: "on",
  sending: "active",
  sent: "ok",
  error: "fault",
};

const STATUS_TEXT: Record<ContactStatus, string> = {
  idle: "Canal disponible",
  sending: "Enviando mensaje",
  sent: "Mensaje enviado",
  error: "No se envió",
};

/** Último sector del tablero: contacto con estado real y regleta de cierre. */
const LandingFooter: React.FC<FooterProps> = ({ ContactForm }) => {
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [ref, inView] = useInView<HTMLDivElement>(0.15);

  const handleSubmit = useCallback(async (name: string, email: string, message: string) => {
    setStatus("sending");
    setErrorMsg("");
    try {
      await submitContact({ name, email, message });
      setStatus("sent");
    } catch (err) {
      const msg = err instanceof ApiClientError
        ? err.message
        : "No se pudo enviar el mensaje. Intenta de nuevo.";
      setErrorMsg(msg);
      setStatus("error");
    }
  }, []);

  return (
    <div className="landing-footer">
      <div ref={ref} className="board-section contact-sector" data-inview={inView}>
        <span className="board-section-rail is-terminal" aria-hidden="true" />
        <div className="board-section-inner contact-grid">
          <div className="contact-copy">
            <span className="board-section-lamp" aria-hidden="true" />
            <h2 id="seccion-contacto" className="board-section-title">
              ¿Un sistema que no encaja en lo habitual?
            </h2>
            <p className="board-section-lead">
              Cuéntame el contexto: qué hace, dónde duele y qué restricciones tiene. Respondo con lo que
              haría y por qué.
            </p>
            <a
              href="https://www.linkedin.com/in/yonathan-gutierrez-rodriguez-742a32bb/"
              target="_blank"
              rel="noreferrer"
              className="route-link"
            >
              Perfil en LinkedIn
            </a>
          </div>

          <div className="contact-panel">
            <p className="contact-status" role="status">
              <span className="lamp" data-state={STATUS_LAMP[status]} aria-hidden="true" />
              {STATUS_TEXT[status]}
            </p>
            {status === "sent" ? (
              <p className="contact-result">Gracias. Te responderé al correo que indicaste.</p>
            ) : (
              <>
                {status === "error" && errorMsg && (
                  <p className="contact-result is-error" role="alert">
                    {errorMsg}
                  </p>
                )}
                <ContactForm onSubmit={handleSubmit} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="footer-strip">
        <nav className="footer-links" aria-label="Enlaces del sitio">
          <Link href="/about">Sobre mí</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/portfolio">Portafolio</Link>
          <Link href="/tools">Herramientas</Link>
        </nav>
        <p className="footer-copy-right">
          © {new Date().getFullYear()} Yonathan Gutierrez R. Software, sistemas distribuidos y operación.
        </p>
      </div>
    </div>
  );
};

export default LandingFooter;
