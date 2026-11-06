import { FiTruck, FiRefreshCw, FiMessageCircle, FiShield } from "react-icons/fi";
import { FREE_DELIVERY_THRESHOLD, RETURN_DAYS } from "../config/site";
import { formatPrice } from "../utils/format";

// Reassurance strip. Wording matches the FAQ and Returns page exactly (single source: config/site.js).
const items = [
  { icon: FiTruck, title: "Islandwide Delivery", text: `Rs. 400 flat, free over ${formatPrice(FREE_DELIVERY_THRESHOLD)}` },
  { icon: FiRefreshCw, title: `${RETURN_DAYS}-Day Returns & Exchanges`, text: "Unused items in original packaging" },
  { icon: FiShield, title: "Pay Your Way", text: "Cash on delivery or secure card payment" },
  { icon: FiMessageCircle, title: "WhatsApp Support", text: "Mon-Fri 9-6, Sat 9-4" },
];

const OurPolicy = () => (
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

export default OurPolicy;
