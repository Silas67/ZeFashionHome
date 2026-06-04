import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

const schema = z.string().trim().email("A valid email is required").max(255);

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    setEmail("");
    toast.success("Subscribed. The next dispatch arrives soon.");
  };

  return (
    <footer className="bg-ink text-paper py-20 md:py-28">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <div className="font-serif text-4xl">ZË</div>
          <p className="mt-6 text-paper/60 max-w-sm leading-relaxed">
            A Nigerian creative platform where fashion meets art. Based in Abuja, Nigeria. Founded by Zizi.
          </p>

          {/* Social */}
          <div className="mt-8 flex items-center gap-5">
            <a
              href="https://www.instagram.com/ze.thebrand?igsh=MWM4d2U2Z28wNG55MA%3D%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-paper/50 hover:text-champagne transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@ze.thebrand?_r=1&_t=ZS-96w2vYGK9dV"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-paper/50 hover:text-champagne transition-colors"
            >
              <svg width="16" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="md:col-span-4">
          <p className="text-[11px] tracking-editorial uppercase text-champagne">Dispatch</p>
          <p className="mt-3 text-paper/70">Quiet correspondence. No noise.</p>
          <form onSubmit={onSubmit} className="mt-6 flex border-b border-paper/30 focus-within:border-champagne transition-colors">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@inbox.com"
              maxLength={255}
              className="flex-1 bg-transparent outline-none py-3 text-paper placeholder:text-paper/30 font-serif text-lg"
            />
            <button
              type="submit"
              disabled={busy}
              className="text-[10px] tracking-editorial uppercase text-paper/80 hover:text-champagne transition-colors px-3"
            >
              {busy ? "…" : "Subscribe"}
            </button>
          </form>
        </div>

        <div className="md:col-span-3 flex flex-col gap-3 text-[11px] tracking-editorial uppercase text-paper/60">
          <a href="#story" className="hover:text-paper">Story</a>
          <a href="#waitlist" className="hover:text-paper">Waitlist</a>
          <a href="#sponsor" className="hover:text-paper">Sponsor</a>
          <a href="mailto:ze.thebrand@gmail.com" className="hover:text-paper">ze.thebrand@gmail.com</a>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-16 pt-8 border-t border-paper/15 flex flex-col md:flex-row justify-between gap-4 text-[10px] tracking-editorial uppercase text-paper/40">
        <span>© MMXXVI · ZË</span>
        <span>LIVING MANNEQUIN — VOL. I</span>
        <span>ABUJA</span>
      </div>
    </footer>
  );
};