import React from "react";
import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";
import NewsLetterBox from "../components/NewsLetterBox";
import SpecialOffers from "../components/SpecialOffers";
import RevealOnScroll from "../components/RevealOnScroll";

const Home = () => {
  return (
    <div>
      <Hero />

      <RevealOnScroll delay={40}>
        <LatestCollection />
      </RevealOnScroll>

      <RevealOnScroll delay={80}>
        <SpecialOffers />
      </RevealOnScroll>

      <RevealOnScroll delay={120}>
        <BestSeller />
      </RevealOnScroll>

      <RevealOnScroll delay={160}>
        <OurPolicy />
      </RevealOnScroll>

      <RevealOnScroll delay={200} distance={18}>
        <NewsLetterBox />
      </RevealOnScroll>
    </div>
  );
};

export default Home;
