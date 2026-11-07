import { assets } from "../assets/assets";
import { useSettings } from "../context/SettingsContext";

// The real OgeeEra logo. An uploaded logo (admin > Settings) overrides the bundled one.
// mix-blend-multiply lets the logo's white background blend into the ivory page.
const Logo = ({ className = "h-12" }) => {
  const { logoUrl, business } = useSettings();
  return (
    <img
      src={logoUrl || assets.logo}
      alt={`${business.name} logo`}
      className={`${className} w-auto object-contain mix-blend-multiply`}
      width="126"
      height="100"
      decoding="async"
    />
  );
};

export default Logo;
