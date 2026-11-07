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
import { useSettings } from "../context/SettingsContext";

// Which sections appear (and their text) is controlled from admin > Promotions.
const Home = () => {
  const { sections } = useSettings();
  return (
    <div>
      <Hero />
      {sections.categories && <CategoryCircles />}
      {sections.newArrivals && <LatestCollection />}
      {sections.promos && <RevealOnScroll delay={20}><PromoBanners /></RevealOnScroll>}
      {sections.bestSellers && <RevealOnScroll delay={30}><BestSeller /></RevealOnScroll>}
      {sections.specialOffers && <RevealOnScroll delay={30}><SpecialOffers /></RevealOnScroll>}
      {sections.policyStrip && <OurPolicy />}
      {sections.reviews && <CustomerReviews />}
      {sections.instagram && <InstagramStrip />}
      {sections.newsletter && <NewsLetterBox />}
    </div>
  );
};

export default Home;
