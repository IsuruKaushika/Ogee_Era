import { useContext, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { useSettings } from "../context/SettingsContext";

// Subscribers are saved in the database (viewable by admin), not just emailed once.
const NewsLetterBox = () => {
  const { backendUrl } = useContext(ShopContext);
  const { newsletter } = useSettings();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/newsletter/subscribe`, { email, source: "homepage" });
      setMsg({ type: data.success ? "ok" : "err", text: data.message });
      if (data.success) setEmail("");
    } catch {
      setMsg({ type: "err", text: "Could not subscribe right now. Please try again." });
    }
    setBusy(false);
  };

  return (
    <section className="bg-sand">
      <div className="container-x py-10 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="font-display text-3xl">{newsletter.title}</h2>
          <p className="mt-1 text-sm text-ink/70">{newsletter.text}</p>
        </div>
        <div className="md:w-[460px]">
          <form onSubmit={submit} className="flex">
            <input className="field flex-1 border-r-0" type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address" />
            <button type="submit" disabled={busy} className="btn-dark">{busy ? "..." : "Subscribe"}</button>
          </form>
          {msg.text && <p className={`mt-2 text-sm ${msg.type === "ok" ? "text-green-700" : "text-red-700"}`}>{msg.text}</p>}
        </div>
      </div>
    </section>
  );
};

export default NewsLetterBox;
