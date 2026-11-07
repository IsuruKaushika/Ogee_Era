import { FiTruck, FiRefreshCw, FiMessageCircle, FiShield } from "react-icons/fi";
import { useSettings } from "../context/SettingsContext";
import { rs } from "../config/siteDefaults";

// Reassurance strip. Every number comes from admin > Settings, so it always matches the FAQ and Returns page.
const OurPolicy = () => {
  const { commerce, business } = useSettings();
  const items = [
    {
      icon: FiTruck,
      title: "Islandwide Delivery",
      text: commerce.freeDeliveryThreshold > 0 ? `${rs(commerce.deliveryFee)} flat, free over ${rs(commerce.freeDeliveryThreshold)}` : `${rs(commerce.deliveryFee)} flat`,
    },
    commerce.returnDays > 0 && { icon: FiRefreshCw, title: `${commerce.returnDays}-Day Returns & Exchanges`, text: "Unused items in original packaging" },
    { icon: FiShield, title: "Pay Your Way", text: "Cash on delivery or secure card payment" },
    business.hours && { icon: FiMessageCircle, title: "Customer Support", text: business.hours },
  ].filter(Boolean);

  return (
    <section className="border-y border-stone/60">
      <div className="container-x grid grid-cols-2 lg:grid-cols-4 gap-6 py-8">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon className="w-5 h-5 mt-0.5 shrink-0 text-taupe" />
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-ink/65 mt-0.5">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OurPolicy;
