import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Isotipo del autor en todos los tamaños que piden navegadores y dispositivos. */}
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" sizes="32x32" href="/brand/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/brand/icon-16.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/brand/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0d1a22" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
