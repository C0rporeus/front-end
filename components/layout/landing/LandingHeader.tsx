import Link from "next/link";
import { useState, useEffect } from "react";

type HeaderMode = "public" | "private";

type LandingHeaderProps = {
  mode?: HeaderMode;
  onPrivateLogout?: () => void;
};

const publicLinks = [
  { href: "/about", label: "Sobre mí" },
  { href: "/blog", label: "Blog" },
  { href: "/portfolio", label: "Portafolio" },
  { href: "/tools", label: "Herramientas" },
];

const privateLinks = [
  { href: "/admin?view=blog", label: "Artículos" },
  { href: "/admin?view=experiences", label: "Experiencias" },
  { href: "/admin?view=skills", label: "Capacidades" },
  { href: "/admin?view=portfolio", label: "Muestras" },
  { href: "/admin?view=ops", label: "Operaciones" },
];

const isCurrent = (pathname: string, href: string) => {
  const target = href.split("?")[0];
  return pathname === target || pathname.startsWith(`${target}/`);
};

/** Regleta superior del tablero: rótulo del autor y enlaces con lámpara de posición. */
const LandingHeader = ({ mode = "public", onPrivateLogout }: LandingHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // La ruta se lee del navegador: el detalle del blog se sirve desde un shell con otra ruta interna.
  const [pathname, setPathname] = useState("");
  const isPrivateMode = mode === "private";
  const navLinks = isPrivateMode ? privateLinks : publicLinks;

  useEffect(() => {
    setPathname(window.location.pathname.replace(/\/$/, "") || "/");
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="board-header" data-scrolled={isScrolled}>
      <nav className="board-header-nav" aria-label="Navegación principal">
        <Link href={isPrivateMode ? "/admin" : "/"} className="board-brand">
          {/* eslint-disable-next-line @next/next/no-img-element -- export estático, isotipo local */}
          <img src="/brand/isotipo-dark.png" alt="" width={36} height={36} className="board-brand-plate" />
          <span className="board-brand-name">Yonathan Gutierrez</span>
        </Link>

        <button
          type="button"
          className="board-menu-button"
          aria-expanded={isMenuOpen}
          aria-controls="main-menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span className="lamp" data-state={isMenuOpen ? "active" : "on"} aria-hidden="true" />
          {isMenuOpen ? "Cerrar" : "Menú"}
        </button>

        <div id="main-menu" className="board-nav-links" data-open={isMenuOpen}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="board-nav-link"
              aria-current={!isPrivateMode && isCurrent(pathname, link.href) ? "page" : undefined}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="lamp" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
          {isPrivateMode && (
            <button type="button" className="board-nav-link board-nav-logout" onClick={onPrivateLogout}>
              <span className="lamp" data-state="fault" aria-hidden="true" />
              Cerrar sesión
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default LandingHeader;
