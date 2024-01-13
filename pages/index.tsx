import Head from "next/head";
import LandingHeader from "../components/layout/landing/LandingHeader";
import LandingSlider from "../components/layout/landing/LandingSlider";
import LandingBlogSlider from "../components/layout/landing/LandingBlogSlider";
import LandingSkillsSlider from "@/components/layout/landing/LandingSkills";
import LandingProjectsSlider from "../components/layout/landing/LandingProjects";
import LandingFooter from "../components/layout/landing/LandingFooter";
import ContactForm from "../components/common/ContactForm"; // Import ContactFormProps

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
        <LandingProjectsSlider />
      </main>
      <footer>
        <LandingFooter ContactForm={ContactForm} />
      </footer>
    </div>
  );
};

export default Home;
