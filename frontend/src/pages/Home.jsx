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

      <LatestCollection />

      <RevealOnScroll delay={20}>
        <SpecialOffers />
      </RevealOnScroll>

      <RevealOnScroll delay={40}>
        <BestSeller />
      </RevealOnScroll>

      <RevealOnScroll delay={50}>
        <OurPolicy />
      </RevealOnScroll>

      <RevealOnScroll delay={60} distance={18}>
        <NewsLetterBox />
      </RevealOnScroll>
    </div>
  );
};

export default Home;
