import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { SITE } from "../config/site";

const Col = ({ title, links }) => (
  <div>
    <p className="text-sm font-medium mb-4">{title}</p>
    <ul className="space-y-2 text-[13px] text-ink/70">
      {links.map(([label, to]) => (
        <li key={label}><Link to={to} className="hover:text-ink">{label}</Link></li>
      ))}
    </ul>
  </div>
);

const Social = ({ href, label, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-ink/70 hover:text-ink">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  </a>
);

const Pay = ({ children }) => <span className="border border-stone bg-white px-2.5 py-1 text-[11px] tracking-wide text-ink/70">{children}</span>;

const Footer = () => (
  <footer className="bg-ivory">
    <div className="container-x pt-12 pb-8 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
      <div>
        <p className="font-display text-2xl tracking-[0.18em] uppercase">OgeeEra</p>
        <p className="mt-3 text-[13px] text-ink/70 max-w-[240px] leading-relaxed">
          Sri Lankan fashion for women and men. Effortless style, delivered islandwide.
        </p>
        <div className="flex gap-4 mt-5">
          <Social href={SITE.social.instagram} label="Instagram">
            <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </Social>
          <Social href={SITE.social.facebook} label="Facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></Social>
          <Social href={SITE.social.tiktok} label="TikTok"><path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /><path d="M15 8h.01" /><path d="M15 2h-2a4 4 0 0 0-4 4v12" /><path d="M19 8a4 4 0 0 0-4-4" /></Social>
        </div>
      </div>

      <Col title="Shop" links={[["New In", "/collection"], ["Dresses", "/category/dresses"], ["Tops", "/category/tops"], ["Lungi & Sarong", "/category/sarongs"], ["Sarees", "/category/sarees"], ["Men", "/category/men"], ["Sale", "/collection?offers=1"]]} />
      <Col title="Customer Care" links={[["Track Order", "/orders"], ["Returns & Exchanges", "/return-policy"], ["Delivery & Payment", "/faq"], ["FAQ", "/faq"], ["Contact Us", "/contact"]]} />
      <Col title="About" links={[["Our Story", "/about"], ["Terms & Conditions", "/terms-and-conditions"], ["Privacy Policy", "/privacy-and-policy"]]} />

      <div>
        <p className="text-sm font-medium mb-4">Get in touch</p>
        <ul className="space-y-2 text-[13px] text-ink/70">
          <li><a className="hover:text-ink" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp {SITE.phone}</a></li>
          <li><a className="hover:text-ink" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
          {SITE.address && <li>{SITE.address}</li>}
          <li className="text-ink/55">{SITE.hours}</li>
        </ul>
      </div>
    </div>

    <div className="border-t border-stone/60">
      <div className="container-x py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink/60">
        <p>&copy; {new Date().getFullYear()} OgeeEra.lk. All rights reserved.</p>
        <div className="flex items-center gap-2" aria-label="Accepted payment methods">
          <Pay>Cash on Delivery</Pay><Pay>VISA</Pay><Pay>Mastercard</Pay><Pay>PayHere</Pay>
        </div>
        <a href="https://www.cigmalabs.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <span>Powered by</span>
          <img src={assets.company} alt="Cigma Labs" className="h-4 w-auto" width="107" height="20" loading="lazy" />
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
