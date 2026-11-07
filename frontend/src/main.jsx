import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ShopContextProvider from "./context/ShopContext.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";

// Drop tags written by scripts/prerender.mjs; Helmet re-adds the live ones.
document.querySelectorAll("[data-prerender]").forEach((el) => el.remove());

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
  <BrowserRouter>
    <SettingsProvider>
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </SettingsProvider>
  </BrowserRouter>
  </HelmetProvider>,
);
