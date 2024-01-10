import Link from "next/link";
import { useState, useEffect } from "react";

const LandingHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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
        isScrolled ? "bg-white shadow-lg" : "bg-transparent"
      } fixed top-0 left-0 w-full z-10 transition-all duration-300`}
    >
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="text-3xl font-bold text-gray-800 dark:text-white">
          <Link href="/">Mi Portafolio</Link>
        </div>
        <div className="flex items-center">
          <Link
            href="/about"
            className="text-gray-800 dark:text-white px-4 py-2"
          >
            Acerca de
          </Link>
          <Link
            href="/portfolio"
            className="text-gray-800 dark:text-white px-4 py-2"
          >
            Portafolio
          </Link>
          <Link
            href="/blog"
            className="text-gray-800 dark:text-white px-4 py-2"
          >
            Blog
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default LandingHeader;
