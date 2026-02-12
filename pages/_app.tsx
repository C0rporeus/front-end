import "../styles/globals.css";
import { AuthProvider } from "@/context/auth-context";
import type { AppProps } from "next/app";

function Front({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default Front;
