# OgeeEra
www.ogeeera.lk

## Managing the site from the admin panel

Almost everything on the storefront is edited in the admin panel (no code changes needed):

- **Promotions**: announcement bar, hero banner and slides (upload pictures), promotion banners, homepage sections, newsletter text.
- **Site Settings**: logo, shop name, email, phone, WhatsApp, address, opening hours, social links, delivery fee, free-delivery level, return and exchange days, order sheet URL.
- **Reviews**: approve or delete customer reviews. **Add/Edit item**: price, discount and units in stock.

### Deploying this version

1. Deploy the **backend first**, then the storefront and admin (the new site calls `/api/settings`, `/api/review`, `/api/newsletter` and `/api/contact`).
2. Run once, from `backend/` with `MONGODB_URI` set: `npm run seed:settings`. It copies the current contact details, social links and order sheet URL into the database (never overwrites existing settings).
3. Backend environment variables: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY`, `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET`, `PAYHERE_SANDBOX`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, optional `SMTP_FROM`, `ORDER_NOTIFY_EMAIL`, `CONTACT_NOTIFY_EMAIL`.
4. Storefront build variables: `VITE_BACKEND_URL`, optional `VITE_GA_ID` (Google Analytics 4) and `VITE_META_PIXEL_ID` (Meta Pixel).
