import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { DEFAULT_SETTINGS, mergeSettings } from "../config/siteDefaults";

const CACHE_KEY = "siteSettingsV1";
const SettingsContext = createContext(DEFAULT_SETTINGS);

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? mergeSettings(DEFAULT_SETTINGS, JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

// Shop settings (contact details, delivery rules, hero, promotions...) managed in the admin panel.
// The last copy is cached so repeat visitors see the right content on first paint.
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(readCache);

  useEffect(() => {
    let live = true;
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/settings`)
      .then((res) => {
        if (!live || !res.data.success) return;
        setSettings(mergeSettings(DEFAULT_SETTINGS, res.data.settings));
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(res.data.settings));
        } catch {
          /* storage may be unavailable */
        }
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);
