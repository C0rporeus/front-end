import "../styles/globals.css";
import "../styles/LandingStyles.css";

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
