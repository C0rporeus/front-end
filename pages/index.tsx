import Head from "next/head";
import LandingHeader from "../components/layout/landing/LandingHeader";
import LandingSlider from "../components/layout/landing/LandingSlider";
import LandingBlogSlider from "@/components/layout/landing/LandingBlogSlider";
import LandingSkillsSlider from "@/components/layout/landing/LandingSkills";

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
        <LandingBlogSlider />
        <LandingSkillsSlider />
      </main>
    </div>
  );
};

export default Home;
