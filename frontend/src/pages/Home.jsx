import Hero from "../components/Hero";
import CategoryCircles from "../components/CategoryCircles";
import LatestCollection from "../components/LatestCollection";
import PromoBanners from "../components/PromoBanners";
import BestSeller from "../components/BestSeller";
import SpecialOffers from "../components/SpecialOffers";
import OurPolicy from "../components/OurPolicy";
import CustomerReviews from "../components/CustomerReviews";
import InstagramStrip from "../components/InstagramStrip";
import NewsLetterBox from "../components/NewsLetterBox";
import RevealOnScroll from "../components/RevealOnScroll";

const Home = () => (
  <div>
    <Hero />
    <CategoryCircles />
    <LatestCollection />
    <RevealOnScroll delay={20}><PromoBanners /></RevealOnScroll>
    <RevealOnScroll delay={30}><BestSeller /></RevealOnScroll>
    <RevealOnScroll delay={30}><SpecialOffers /></RevealOnScroll>
    <OurPolicy />
    <CustomerReviews />
    <InstagramStrip />
    <NewsLetterBox />
  </div>
);

export default Home;
