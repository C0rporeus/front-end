import Link from "next/link";
import React from "react";
import ContactForm from "../../common/ContactForm";

// Define the props for the Footer component
interface FooterProps {
  ContactForm: React.ComponentType;
  AboutLink: React.ComponentType;
  // Add any other components you want to include in the footer here
}

const LandingFooter: React.FC<FooterProps> = ({ ContactForm }) => (
  <footer className="landing-footer">
    <div className="footer-contact-form">
      <ContactForm />
    </div>
    <div className="footer-links">
      <Link href="/about">A cerca de mí</Link>
      <Link href="/blog">Blog</Link>
    </div>
    <div className="footer-copy-right">
      © {new Date().getFullYear()} Yonathan Gutierrez R. Todos los derechos
      reservados.
    </div>
    {/* Render any other components you want to include in the footer here */}
  </footer>
);

export default LandingFooter;
