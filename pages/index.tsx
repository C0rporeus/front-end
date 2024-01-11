import Head from "next/head";
import LandingHeader from "../components/layout/landing/LandingHeader";
import LandingSlider from "../components/layout/landing/LandingSlider";

const Home = () => {
  return (
    <div>
      <Head>
        <title>Yonathan Gutierrez R / Consultor TI</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <LandingHeader />

      <main className="mt-[70px]">
        <LandingSlider />
      </main>

      {/* Incluir aquí otros componentes como Footer si es necesario */}
    </div>
  );
};

export default Home;
