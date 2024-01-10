import Head from "next/head";
import LandingHeader from "../components/layout/LandingHeader";

const Home = () => {
  return (
    <div>
      <Head>
        <title>Mi Portafolio</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <LandingHeader />

      <main></main>

      {/* Incluir aquí otros componentes como Footer si es necesario */}
    </div>
  );
};

export default Home;
