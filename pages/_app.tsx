import "../styles/globals.css";
import { AuthProvider } from "@/context/auth-context";

function Front({
  Component,
  pageProps,
}: {
  Component: React.ComponentType<any>;
  pageProps: any;
}) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default Front;
