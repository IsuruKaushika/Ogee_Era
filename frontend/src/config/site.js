// One place for business details and commercial rules. Keep the delivery rules in sync
// with backend/config/shop.js (the server is the source of truth for the final total).
export const SITE = {
  name: "OgeeEra",
  url: "https://www.ogeeera.lk",
  email: "ogeeeraa@gmail.com", // TODO: move to a business-domain address, e.g. hello@ogeeera.lk
  phone: "+94 71 220 5395",
  whatsapp: "94712205395",
  address: "", // TODO: add a business address; shown in the footer when set
  hours: "Mon-Fri 9:00 AM - 6:00 PM, Sat 9:00 AM - 4:00 PM, closed Sunday",
  social: {
    facebook: "https://www.facebook.com/share/1BZtCgfBgd/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/ogee_era?igsh=MTI0aG94cG5rMGQxMA==",
    tiktok: "https://www.tiktok.com/@0gee_era?_t=ZS-8vqiO4zOGkK&_r=1",
  },
};

export const DELIVERY_FEE = 400;
export const FREE_DELIVERY_THRESHOLD = 7500;
export const RETURN_DAYS = 7;

export const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota",
  "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale",
  "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya",
];
