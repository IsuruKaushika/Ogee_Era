import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { rs } from "../config/siteDefaults";

// Text comes from admin > Promotions. If left empty it falls back to the delivery and returns rules.
const AnnouncementBar = () => {
  const { announcement, commerce } = useSettings();
  if (!announcement.enabled) return null;

  const left =
    announcement.text ||
    (commerce.freeDeliveryThreshold > 0 ? `Free delivery over ${rs(commerce.freeDeliveryThreshold)}` : `Islandwide delivery ${rs(commerce.deliveryFee)}`);
  const second = announcement.secondaryText || (commerce.returnDays > 0 ? `Easy returns within ${commerce.returnDays} days` : "");

  return (
    <div className="bg-sand text-[11px] sm:text-xs text-ink/80 border-b border-stone/60">
      <div className="container-x flex items-center justify-between h-9">
        <p className="truncate">
          {left}
          {second && (
            <span className="hidden sm:inline">
              <span className="mx-3 text-stone">|</span>
              {second}
            </span>
          )}
        </p>
        <div className="flex items-center gap-5 shrink-0">
          <Link to="/orders" className="hover:text-ink">Track Order</Link>
          <Link to="/faq" className="hover:text-ink">Help Center</Link>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
