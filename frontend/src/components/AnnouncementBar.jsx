import { Link } from "react-router-dom";
import { FREE_DELIVERY_THRESHOLD, RETURN_DAYS } from "../config/site";
import { formatPrice } from "../utils/format";

const AnnouncementBar = () => (
  <div className="bg-sand text-[11px] sm:text-xs text-ink/80 border-b border-stone/60">
    <div className="container-x flex items-center justify-between h-9">
      <p className="truncate">
        Free delivery over {formatPrice(FREE_DELIVERY_THRESHOLD)}
        <span className="hidden sm:inline">
          <span className="mx-3 text-stone">|</span>Easy returns within {RETURN_DAYS} days
        </span>
      </p>
      <div className="flex items-center gap-5 shrink-0">
        <Link to="/orders" className="hover:text-ink">Track Order</Link>
        <Link to="/faq" className="hover:text-ink">Help Center</Link>
      </div>
    </div>
  </div>
);

export default AnnouncementBar;
