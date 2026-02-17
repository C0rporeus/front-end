import Link from "next/link";
import React, { useCallback, useState } from "react";
import { submitContact } from "@/api/contact";
import { ApiClientError } from "@/api/http-client";

type FooterProps = {
  ContactForm: React.ComponentType<{ onSubmit: (name: string, email: string, message: string) => void }>;
};

const LandingFooter: React.FC<FooterProps> = ({ ContactForm }) => {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
    <footer className="landing-footer">
      <div className="footer-contact-form">
        <p className="mb-3 text-sm text-text-secondary">
          ¿Tienes un reto tecnico? Conversemos sobre una solucion aterrizada a tu contexto.
        </p>

        {status === "sent" ? (
          <p className="rounded-xl border border-emerald-500/60 bg-emerald-500/15 p-3 text-emerald-200">
            Mensaje enviado. Te respondere pronto.
          </p>
        ) : (
          <>
            {status === "error" && errorMsg && (
              <p className="mb-3 rounded-xl border border-rose-500/60 bg-rose-500/15 p-3 text-rose-200" role="alert">
                {errorMsg}
              </p>
            )}
            <ContactForm onSubmit={handleSubmit} />
            {status === "sending" && (
              <p className="mt-2 text-sm text-text-muted">Enviando...</p>
            )}
          </>
        )}
      </div>
      <div className="footer-links" aria-label="Enlaces del sitio">
        <Link href="/about">Acerca de mi</Link>
        <Link href="/tools">Herramientas</Link>
        <Link href="/portfolio">Portafolio</Link>
      </div>
      <div className="footer-copy-right">
        © {new Date().getFullYear()} Yonathan Gutierrez R. Consultoria y desarrollo de productos digitales.
      </div>
    </footer>
  );
};

export default LandingFooter;
