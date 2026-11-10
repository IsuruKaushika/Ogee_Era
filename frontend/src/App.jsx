import { useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import AnnouncementBar from "./components/AnnouncementBar";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import About from "./pages/About";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFail";
import OrderConfirmed from "./pages/OrderConfirmed";
import WhatsAppFloat from "./components/WhatsappFloat";
import Terms from "./pages/Terms";
import Returns from "./pages/Returns";
import ScrollToTop from "./components/ScrollToTop";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import { ToastContainer } from "react-toastify"; //used for notifications
import "react-toastify/dist/ReactToastify.css";
import Policy from "./pages/Policy";
import RouteSeo from "./components/RouteSeo";
import Faq from "./pages/Faq";
import { initAnalytics, trackPageView } from "./utils/analytics";

// Inner pages share the page gutters; the home page lays out its own full-width sections.
const PageShell = () => (
  <div className="container-x">
    <Outlet />
  </div>
);

const AnalyticsTracker = () => {
  const { pathname } = useLocation();
  useEffect(() => initAnalytics(), []);
  useEffect(() => trackPageView(pathname), [pathname]);
  return null;
};

const App = () => (
  <div className="min-h-screen flex flex-col bg-ivory">
    <ToastContainer position="top-center" autoClose={2500} hideProgressBar closeButton={false} limit={3} pauseOnFocusLoss={false} newestOnTop />
    <RouteSeo />
    <ScrollToTop />
    <AnalyticsTracker />
    <AnnouncementBar />
    <Navbar />
    <SearchBar />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<PageShell />}>
          <Route path="/collection" element={<Collection />} />
          <Route path="/category/:slug" element={<Collection />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/login" element={<Login />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order-confirmed" element={<OrderConfirmed />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/terms-and-conditions" element={<Terms />} />
          <Route path="/privacy-and-policy" element={<Policy />} />
          <Route path="/return-policy" element={<Returns />} />
        </Route>
      </Routes>
    </main>
    <WhatsAppFloat />
    <Footer />
  </div>
);

export default App;
