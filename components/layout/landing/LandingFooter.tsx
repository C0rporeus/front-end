import Link from "next/link";
import React from "react";

// Define the props for the Footer component
interface FooterProps {
  ContactForm: React.ComponentType<{ onSubmit: (name: string, email: string, message: string) => void }>;
}

const LandingFooter: React.FC<FooterProps> = ({ ContactForm }) => (
  <footer className="landing-footer">
    <div className="footer-contact-form">
      <ContactForm
        onSubmit={(name, email, message) => {
          console.log("Nuevo mensaje de contacto", { name, email, message });
        }}
      />
    </div>
    <div className="footer-links">
      <Link href="/about">A cerca de mí</Link>
      <Link href="/tools">Tools</Link>
    </div>
    <div className="footer-copy-right">
      © {new Date().getFullYear()} Yonathan Gutierrez R. Todos los derechos
      reservados.
    </div>
    {/* Render any other components you want to include in the footer here */}
  </footer>
);

export default LandingFooter;
