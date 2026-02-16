import Link from "next/link";
import React from "react";

// Define the props for the Footer component
type FooterProps = {
  ContactForm: React.ComponentType<{ onSubmit: (name: string, email: string, message: string) => void }>;
};

const LandingFooter: React.FC<FooterProps> = ({ ContactForm }) => (
  <footer className="landing-footer">
    <div className="footer-contact-form">
      <p className="mb-3 text-sm text-text-secondary">
        ¿Tienes un reto tecnico? Conversemos sobre una solucion aterrizada a tu contexto.
      </p>
      <ContactForm
        onSubmit={(_name, _email, _message) => {
          // TODO: integrar con endpoint de contacto
        }}
      />
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

export default LandingFooter;
