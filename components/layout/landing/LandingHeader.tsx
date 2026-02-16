import Link from "next/link";
import { useState, useEffect } from "react";

type HeaderMode = "public" | "private";

type LandingHeaderProps = {
  mode?: HeaderMode;
  onPrivateLogout?: () => void;
};

const publicLinks = [
  { href: "/about", label: "Sobre mi" },
  { href: "/blog", label: "Blog" },
  { href: "/portfolio", label: "Portafolio" },
  { href: "/tools", label: "Herramientas" },
];

const privateLinks = [
  { href: "/admin?view=blog", label: "Articulos" },
  { href: "/admin?view=experiences", label: "Experiencias" },
  { href: "/admin?view=skills", label: "Capacidades" },
  { href: "/admin?view=portfolio", label: "Muestras" },
  { href: "/admin?view=ops", label: "Operaciones" },
];

const LandingHeader = ({ mode = "public", onPrivateLogout }: LandingHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isPrivateMode = mode === "private";
  const navLinks = isPrivateMode ? privateLinks : publicLinks;

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 50); // Cambia el estado cuando el scroll pasa de 50px
    };

    // Escuchamos al evento scroll
    window.addEventListener("scroll", handleScroll);

    return () => {
      // Limpiamos el listener al desmontar el componente
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`${
        isScrolled
          ? "bg-surface-900/95 text-text-primary shadow-soft backdrop-blur-md"
          : "bg-surface-900/78 text-text-primary shadow-none backdrop-blur-sm"
      } fixed left-0 top-0 z-50 w-full border-b border-slate-700/60 transition-all duration-300`}
    >
      <nav
        className={`${
          isScrolled ? "text-text-primary" : "text-text-primary"
        } mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between px-4 py-3 md:px-8`}
        aria-label="Navegacion principal"
      >
        <div
          className="glitch-logo text-2xl font-bold tracking-tight md:text-3xl"
          data-text="Yonathan G."
        >
          <Link href={isPrivateMode ? "/admin" : "/"}>Yonathan G.</Link>
        </div>

        <button
          type="button"
          className="rounded-md border border-slate-500/60 px-3 py-2 text-sm md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="main-menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          Menu
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-800/45 hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
          {isPrivateMode && (
            <button
              type="button"
              className="ml-2 rounded-md border border-rose-400/45 bg-rose-500/20 px-3 py-2 text-sm font-medium text-rose-100 hover:bg-rose-500/35"
              onClick={onPrivateLogout}
            >
              Cerrar sesion
            </button>
          )}
        </div>
      </nav>

      <div id="main-menu" className={`${isMenuOpen ? "block" : "hidden"} border-t border-slate-700/50 md:hidden`}>
        <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-3">
          {navLinks.map((link) => (
            <Link
              key={`mobile-${link.href}`}
              href={link.href}
              className="rounded-md px-2 py-2 text-text-secondary hover:bg-surface-800/50 hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
          {isPrivateMode && (
            <button
              type="button"
              className="mt-1 rounded-md border border-rose-400/45 bg-rose-500/20 px-2 py-2 text-left font-medium text-rose-100 hover:bg-rose-500/35"
              onClick={onPrivateLogout}
            >
              Cerrar sesion
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
