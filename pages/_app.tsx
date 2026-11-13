import "../styles/globals.css";
import "highlight.js/styles/github-dark.css";
import { Archivo, B612_Mono } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import type { AppProps } from "next/app";

// Fuentes autoalojadas en el build: sin peticiones a Google en tiempo de ejecución.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

const b612Mono = B612_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-b612-mono",
});

function Front({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className={`${archivo.variable} ${b612Mono.variable} app-root`}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}

export default Front;
