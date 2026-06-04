import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import sponsorImg from "@/assets/sponsor.jpg";

const packages = [
  {
    name: "Bronze",
    price: "₦1,000,000",
    color: "border-ink/15",
    perks: [
      "Recognition in select promotional materials (where relevant)",
      "Opportunity for visual coverage and event mentions",
      "Consideration for future campaigns and showcases",
      "Exclusive benefit: One curated Zë exclusive wear",
    ],
  },
  {
    name: "Silver",
    price: "₦3,000,000",
    featured: true,
    color: "border-rose",
    perks: [
      "Logo on select promotional materials",
      "Exhibition or activation space",
      "Product placement & sampling integration",
      "6 VIP invitations",
      "Exclusive benefit: Three curated Zë exclusive wear",
    ],
  },
  {
    name: "Gold",
    price: "₦5,000,000",
    color: "border-champagne",
    perks: [
      "Co-branding on all promotional materials",
      "Logo placement on stage/backdrop",
      "VIP brand activation space",
      "Media interviews and press mentions",
      "Product placement & sampling opportunities",
      "Access to Zë's creative recruitment pool",
      "10 VIP invitations",
      "Exclusive benefit: Five curated Zë exclusive wears",
    ],
  },
];

const schema = z.object({
  company: z.string().trim().min(2, "Company name required").max(120),
  contact: z.string().trim().min(2, "Contact name required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  interest: z.string().trim().max(800).optional().or(z.literal("")),
});

export const Sponsor = () => {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const data = {
      company: String(fd.get("company") ?? ""),
      contact: String(fd.get("contact") ?? ""),
      email: String(fd.get("email") ?? ""),
      interest: String(fd.get("interest") ?? ""),
    };
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    // Email automation placeholder
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    (e.target as HTMLFormElement).reset();
    toast.success("Inquiry received. Our partnerships team will be in touch.");
  };

  return (
    <section id="sponsor" className="bg-paper text-ink py-28 md:py-40">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-12 items-end mb-20">
          <div className="md:col-span-7">
            <p className="text-[11px] tracking-editorial uppercase text-rose">— Partnership</p>
            <h2 className="mt-6 font-serif text-5xl md:text-7xl leading-[0.95] text-balance">
              Build with ZË, in
              <br />
              <em className="text-rose">quiet luxury.</em>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-ink-soft leading-relaxed">
              Three considered partnership tiers — each crafted to align your brand with
              an audience of designers, collectors, and culturally engaged patrons.
            </p>
          </div>
        </div>

        {/* Packages */}
        <div className="grid md:grid-cols-3 gap-px bg-ink/10 mb-28">
          {packages.map((p) => (
            <div
              key={p.name}
              className={`bg-paper p-8 md:p-10 border-t-2 ${p.color} ${p.featured ? "md:-translate-y-4" : ""
                } transition-transform duration-700`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif text-3xl">{p.name}</h3>
                {p.featured && (
                  <span className="text-[10px] tracking-editorial uppercase text-rose">
                    Most chosen
                  </span>
                )}
              </div>
              <div className="mt-2 font-serif text-4xl text-ink">{p.price}</div>
              <div className="hairline my-8" />
              <ul className="space-y-3 text-sm text-ink-soft">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex gap-3">
                    <span className="text-rose mt-2 h-px w-3 bg-rose flex-shrink-0" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant={p.featured ? "default" : "outline"} className="mt-10 w-full">
                <a href="#sponsor-form">Inquire</a>
              </Button>
            </div>
          ))}
        </div>

        {/* Inquiry */}
        <div id="sponsor-form" className="grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <img
              src={sponsorImg}
              alt="Quiet luxury — chiffon detail"
              loading="lazy"
              width={1280}
              height={1280}
              className="w-full h-auto object-cover shadow-[var(--shadow-editorial)]"
            />
          </div>
          <form onSubmit={handleSubmit} className="md:col-span-7 space-y-8" noValidate>
            <div>
              <p className="text-[11px] tracking-editorial uppercase text-rose">Inquiry</p>
              <h3 className="mt-4 font-serif text-4xl md:text-5xl">Begin the conversation.</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <DarkField name="company" label="Company" error={errors.company} />
              <DarkField name="contact" label="Contact name" error={errors.contact} />
              <DarkField name="email" type="email" label="Email" error={errors.email} />
              <DarkField name="interest" label="Tier of interest" placeholder="Atelier · Salon · Couture" error={errors.interest} />
            </div>
            <Button type="submit" size="lg" disabled={submitting} className="min-w-[220px]">
              {submitting ? "Sending…" : "Send Inquiry"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

const DarkField = ({
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
    <span className="text-[10px] tracking-editorial uppercase text-ink/50">{label}</span>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      maxLength={800}
      className="mt-3 w-full bg-transparent border-0 border-b border-ink/25 focus:border-rose outline-none py-3 font-serif text-xl text-ink placeholder:text-ink/25 transition-colors"
    />
    {error && <span className="block mt-2 text-xs text-rose">{error}</span>}
  </label>
);
