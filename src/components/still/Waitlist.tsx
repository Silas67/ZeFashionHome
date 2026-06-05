import { useState } from "react";
import QRCode from "qrcode";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WaitlistModal } from "./WaitlistModal";

type Tier = "general" | "vip" | "exhibitor" | "sponsor";

const tiers: { id: Tier; label: string; sub: string; note: string }[] = [
  { id: "general", label: "General", sub: "Open admission", note: "Access to the full Living Mannequin exhibition space, visual art installations, live performances, and champagne service. A curated evening, open to all." },
  { id: "vip", label: "VIP", sub: "By invitation", note: "Priority entry, reserved front positioning within the exhibition space, and direct access to the Zë creative community. By invitation only." },
  { id: "exhibitor", label: "Creatives", sub: "Designers & artists", note: "For designers, artists, performers, and makers who are part of or wish to join the Zë creative network. Your work is not background — it is the exhibition." },
  { id: "sponsor", label: "Sponsor", sub: "Brand partners", note: "For brands and organisations partnering with Zë. Select your tier of interest and our team will be in touch to discuss alignment, benefits, and activation." },
];

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("A valid email is required").max(255),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const Waitlist = () => {
  const [tier, setTier] = useState<Tier>("general");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ qr: string; code: string; name: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      city: String(fd.get("city") ?? ""),
      note: String(fd.get("note") ?? ""),
    };
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      // Generate pass code and QR before the API call so we can
      // embed the QR in the email on the server side.
      const code = `ZE-${tier.toUpperCase().slice(0, 3)}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

      const payload = JSON.stringify({ event: "LIVING MANNEQUIN", tier, code, name: parsed.data.name });
      const qr = await QRCode.toDataURL(payload, {
        margin: 1,
        width: 480,
        color: { dark: "#121212", light: "#f8f8f8" },
      });

      // Send to API — passes everything the server needs to build the email.
      const res = await fetch("https://ze-mailer.houseofze.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          code,
          qr,
          ...parsed.data,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "Server error");
      }

      setConfirmation({ qr, code, name: parsed.data.name });
      toast.success("You're on the list. A confirmation has been sent.");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <WaitlistModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <section id="waitlist" className="bg-ink text-paper py-28 md:py-40 grain relative">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <p className="text-[11px] tracking-editorial uppercase text-champagne">— The List</p>
            <h2 className="mt-6 font-serif text-5xl md:text-6xl leading-[0.95] text-balance">
              Reserve
              <br />
              your <em className="text-rose">place.</em>
            </h2>
            <p className="mt-8 text-paper/65 font-light leading-relaxed max-w-sm">
              Admittance is by ticket only. Submit your details and select the tier that
              describes you best. You will receive a digital QR pass upon confirmation.
            </p>
          </div>

          <div className="md:col-span-8">
            <AnimatePresence mode="wait">
              {confirmation ? (
                <motion.div
                  key="conf"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="border border-paper/15 p-8 md:p-12 bg-paper/[0.03] backdrop-blur-sm"
                >
                  <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div>
                      <p className="text-[11px] tracking-editorial uppercase text-champagne">
                        Confirmed
                      </p>
                      <h3 className="mt-4 font-serif text-4xl md:text-5xl leading-tight">
                        Welcome,
                        <br />
                        <em className="text-rose">{confirmation.name.split(" ")[0]}.</em>
                      </h3>
                      <p className="mt-6 text-paper/70 leading-relaxed">
                        Present this pass at the entrance on the evening of the exhibition.
                        A copy has been sent to your inbox.
                      </p>
                      <dl className="mt-8 space-y-3 text-sm">
                        <div className="flex justify-between border-t border-paper/15 pt-3">
                          <dt className="text-paper/50 uppercase tracking-luxe text-[10px]">Pass</dt>
                          <dd className="font-mono text-paper">{confirmation.code}</dd>
                        </div>
                        <div className="flex justify-between border-t border-paper/15 pt-3">
                          <dt className="text-paper/50 uppercase tracking-luxe text-[10px]">Tier</dt>
                          <dd className="capitalize">{tier}</dd>
                        </div>
                        <div className="flex justify-between border-t border-paper/15 pt-3">
                          <dt className="text-paper/50 uppercase tracking-luxe text-[10px]">Date</dt>
                          <dd>14 · 08 · 2026</dd>
                        </div>
                      </dl>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-8 text-paper hover:bg-paper/10"
                        onClick={() => setConfirmation(null)}
                      >
                        ← Add another guest
                      </Button>
                    </div>
                    <div className="bg-paper p-4 md:p-6 mx-auto">
                      <img
                        src={confirmation.qr}
                        alt="QR ticket pass"
                        className="w-full max-w-[280px] aspect-square"
                      />
                      <p className="text-center text-[10px] tracking-editorial uppercase text-ink/60 mt-3">
                        LIVING MANNEQUIN · Pass {confirmation.code}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-10"
                  noValidate
                >
                  {/* Tier segmented control */}
                  <div>
                    <label className="text-[10px] tracking-editorial uppercase text-paper/50">
                      Select tier
                    </label>
                    <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-px bg-paper/10">
                      {tiers.map((t) => {
                        const active = tier === t.id;
                        return (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => setTier(t.id)}
                            className={`p-5 text-left transition-all duration-500 ${active
                              ? "bg-champagne text-ink"
                              : "bg-ink text-paper hover:bg-paper/5"
                              }`}
                          >
                            <div className="font-serif text-2xl">{t.label}</div>
                            <div
                              className={`text-[10px] tracking-editorial uppercase mt-1 ${active ? "text-ink/60" : "text-paper/50"
                                }`}
                            >
                              {t.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-sm text-paper/55 italic font-serif">
                      {tiers.find((t) => t.id === tier)?.note}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Field name="name" label="Full Name" placeholder="Yael Cohen" error={errors.name} />
                    <Field
                      name="email"
                      type="email"
                      label="Email"
                      placeholder="you@studio.com"
                      error={errors.email}
                    />
                    <Field name="city" label="City" placeholder="Abuja" error={errors.city} />
                    <Field
                      name="note"
                      label={tier === "exhibitor" ? "Portfolio link" : tier === "sponsor" ? "Company" : "A short note (optional)"}
                      placeholder=""
                      error={errors.note}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-2">
                    <Button
                      type="submit"
                      variant="champagne"
                      size="lg"
                      disabled={submitting}
                      className="min-w-[220px]"
                    >
                      {submitting ? "Confirming…" : "Submit application"}
                    </Button>
                    <Button variant="ghost" size="lg" className="text-paper hover:bg-paper/10" onClick={() => setModalOpen(true)}>
                      Join the Waitlist
                    </Button>
                    <p className="text-[11px] text-paper/45 max-w-xs leading-relaxed">
                      By submitting you agree to receive event correspondence. Unsubscribe anytime.
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>

  );
};

const Field = ({
  name,
  label,
  type = "text",
  placeholder,
  error,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
}) => (
  <label className="block">
    <span className="text-[10px] tracking-editorial uppercase text-paper/50">{label}</span>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      maxLength={500}
      className="mt-3 w-full bg-transparent border-0 border-b border-paper/25 focus:border-champagne outline-none py-3 font-serif text-xl text-paper placeholder:text-paper/25 transition-colors"
    />
    {error && <span className="block mt-2 text-xs text-rose">{error}</span>}
  </label>
);