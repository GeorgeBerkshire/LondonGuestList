import { useMemo, useState } from "react";
import { Check, Shield } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { enGB } from "date-fns/locale";
import "react-day-picker/dist/style.css";

// ====== OWNER SETTINGS ======
const BRAND = {
  name: "LondonGuestlist",
  domain: "LondonGuestlist.co.uk",
  primary: "#0b0b0b",
  accent: "#d4af37",
  logo: "/logo.png",
};

// Your real WhatsApp number
const CONTACT_WHATSAPP = "+447946051428";

const SELENE = {
  title: "Selene — Mayfair",
  nights: ["Wednesday", "Friday", "Saturday", "Sunday"],
  heroImage: "/selene.jpg",
};

// ====== UTILITIES ======
const allowedWeekdays = new Set([0, 3, 5, 6]); // Sun=0, Wed=3, Fri=5, Sat=6
const PHONE_RE = /^\+?\d[\d\s()-]{7,}$/;

function formatDateISOLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseISODateLocal(iso) {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}
function formatNice(d) {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}
function cx(...c) { return c.filter(Boolean).join(" "); }

// ====== CUSTOM DAYPICKER THEME (clean black + gold) ======
const DAYPICKER_CSS = `
  .rdp { background:#0b0b0b; color:#e5e5e5; border:1px solid rgba(255,255,255,.1); border-radius:12px; padding:12px; width:100%; font-family:inherit; }
  .rdp-caption { display:flex; justify-content:space-between; align-items:center; padding:4px; margin-bottom:6px; }
  .rdp-nav_button { color:#e5e5e5; border:1px solid rgba(255,255,255,.15); border-radius:10px; padding:6px 10px; }
  .rdp-nav_button:hover { background:rgba(255,255,255,.08); }
  .rdp-head { color:#a3a3a3; text-transform:uppercase; font-size:12px; }
  .rdp-head_cell { padding:6px 0; }
  .rdp-cell { padding:2px; }
  .rdp-day { border-radius:10px; padding:10px 0; }
  .rdp-day:hover { background:rgba(255,255,255,.06); }
  .rdp-day_today { outline:1px dashed rgba(255,255,255,.25); outline-offset:2px; }
  .rdp-day_selected { background:#d4af37; color:#0b0b0b; }
  .rdp-day_selected:hover { background:#d4af37; }
  .rdp-day_disabled { opacity:.25; pointer-events:none; }
`;

// ====== MAIN APP ======
export default function App() {
  const [form, setForm] = useState({ fullName: "", phone: "", instagram: "", females: "", males: "", dateISO: "", agree: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const selectedDate = parseISODateLocal(form.dateISO);
  const today = new Date();
  today.setHours(0,0,0,0);

  function onSelectDate(d) {
    if (!d) return;
    if (!allowedWeekdays.has(d.getDay())) return;
    setForm((f) => ({ ...f, dateISO: formatDateISOLocal(d) }));
  }

  const valid = useMemo(() => {
    const females = Number(form.females);
    const males = Number(form.males);
    const ratioOk = males === 0 || females / males >= 3;
    return (
      form.fullName.trim().length > 2 &&
      PHONE_RE.test(form.phone.trim()) &&
      females + males > 0 &&
      !!form.dateISO &&
      form.agree &&
      ratioOk
    );
  }, [form]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const females = Number(form.females);
    const males = Number(form.males);
    if (males > 0 && females / males < 3) {
      setError("Group must include at least 3 girls for every 1 guy.");
      return;
    }
    if (!valid) return;

    setSubmitting(true);
    try {
      const msg = `Selene Request — ${formatNice(parseISODateLocal(form.dateISO))}%0AName: ${encodeURIComponent(form.fullName)}%0APhone: ${encodeURIComponent(form.phone)}%0AFemales: ${form.females}%0AMales: ${form.males}%0AInsta: ${encodeURIComponent(form.instagram || "-")}`;
      window.open(`https://wa.me/${CONTACT_WHATSAPP.replace(/\+/g, "")}?text=${msg}`, "_blank");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again or DM us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-neutral-200">
      <style>{DAYPICKER_CSS}</style>

      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={BRAND.logo} alt="London Guestlist logo" className="h-20 w-auto" />
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#selene" className="hover:text-white/90">Selene</a>
            <a href="#book" className="hover:text-white/90">Guestlist</a>
            <a href="#book" className="px-4 py-2 rounded-full font-medium" style={{ background: BRAND.accent, color: "#0b0b0b" }}>Book Selene</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-light leading-tight">Mayfair nights, curated with <span style={{ color: BRAND.accent }}>discretion</span></h1>
            <p className="mt-5 text-neutral-400 max-w-prose">{BRAND.name} places invited girls on exclusive guestlists at London’s most sought-after venues. Currently featuring <span className="text-neutral-200">Selene</span> in Mayfair.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#book" className="px-5 py-3 rounded-full ring-1 ring-white/15 hover:ring-white/30" style={{ background: BRAND.accent, color: "#0b0b0b" }}>Join Selene Guestlist</a>
              <a href="#selene" className="px-5 py-3 rounded-full border border-white/15 hover:border-white/30">About Selene</a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={SELENE.heroImage} alt="Selene nightclub" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-black/60 backdrop-blur rounded-2xl border border-white/10 px-5 py-4 flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <div className="text-sm">Private & secure — we never sell data.</div>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING FORM */}
      <section id="book" className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 md:p-10">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">Join the Selene Guestlist</h2>
          <p className="text-neutral-400 mb-8">Girls only. Free to request — we’ll confirm over WhatsApp.</p>
          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-start gap-3"><Check className="w-5 h-5 mt-0.5 text-emerald-400" /><div><div className="font-medium text-emerald-200">Request sent.</div><p className="text-sm text-neutral-300 mt-1">We’ve opened WhatsApp with your details prefilled. We’ll be in touch soon.</p></div></div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
                <div><label className="block text-sm text-neutral-300 mb-2">Full name</label><input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="e.g., Maya Patel" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" /></div>
                <div><label className="block text-sm text-neutral-300 mb-2">Phone (WhatsApp)</label><input name="phone" value={form.phone} onChange={handleChange} required placeholder="e.g., +44 7…" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" /></div>
                <div><label className="block text-sm text-neutral-300 mb-2">Instagram (optional)</label><input name="instagram" value={form.instagram} onChange={handleChange} placeholder="@username" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" /></div>
                <div><label className="block text-sm text-neutral-300 mb-2">Female Guests</label><input name="females" value={form.females} onChange={handleChange} type="number" min={0} required placeholder="e.g., 3" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" /></div>
                <div><label className="block text-sm text-neutral-300 mb-2">Male Guests</label><input name="males" value={form.males} onChange={handleChange} type="number" min={0} required placeholder="e.g., 1" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" /></div>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm text-neutral-300 mb-2">Date attending</label>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={onSelectDate}
                  disabled={[ { before: today }, { daysOfWeek: [1,2,4] } ]}
                  showOutsideDays={false}
                  captionLayout="buttons"
                  locale={enGB}
                />
                {form.dateISO && <p className="mt-2 text-sm text-neutral-400">Selected: {formatNice(parseISODateLocal(form.dateISO))}</p>}
              </div>
              <div className="md:col-span-3 flex flex-col gap-4">
                <label className="inline-flex items-center gap-3 text-sm">
                  <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="w-4 h-4" />I am over 18 and agree to be contacted about this booking.
                </label>
                {error && <div className="text-red-400 text-sm">{error}</div>}
                <div className="flex flex-wrap items-center gap-3">
                  <button disabled={!valid || submitting} type="submit" className={cx("px-6 py-3 rounded-xl text-black font-medium", "disabled:opacity-50 disabled:cursor-not-allowed")} style={{ background: BRAND.accent }}>{submitting ? "Sending…" : "Request Guestlist"}</button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ABOUT SELENE / GALLERY */}
      <section id="selene" className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">About Selene</h2>
        <p className="text-neutral-400 mb-8">Selene is Mayfair’s most exclusive nightclub experience. Expect elegance, curated music, and an unforgettable atmosphere.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-white/10">
              <img src={`/gallery${i}.jpg`} alt={`Selene gallery ${i}`} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
