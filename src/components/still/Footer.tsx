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
    // Email automation placeholder — connect to provider (Mailchimp, Resend, etc.)
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
            A Nigerian creative platform where fashion meets art. Based in Abuja, Nigeria. Founded by Ahava Yoffi.
          </p>
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
          <a href="mailto:hello@ahavayoffi.com" className="hover:text-paper">ze.thebrand@gmail.com
          </a>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-16 pt-8 border-t border-paper/15 flex flex-col md:flex-row justify-between gap-4 text-[10px] tracking-editorial uppercase text-paper/40">
        <span>© MMXXVI · ZË</span>
        <span>LIVING MANNEQUIN — VOL. I
        </span>
        <span>ABUJA
        </span>
      </div>
    </footer>
  );
};
