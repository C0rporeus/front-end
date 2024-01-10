import "../styles/globals.css";

function Front({
  Component,
  pageProps,
}: {
  Component: React.ComponentType<any>;
  pageProps: any;
}) {
  return <Component {...pageProps} />;
}

export default Front;
