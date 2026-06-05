import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const WORKER_URL = "https://ze-mailer.houseofze.workers.dev";

const benefits = [
    { icon: "✦", text: "Priority access — confirmed before general registration opens" },
    { icon: "✦", text: "First to know — collections and details announced to you first" },
    { icon: "✦", text: "Exclusive discount on future Zë label pieces post-event" },
    { icon: "✦", text: "Guaranteed souvenir bag, reserved for confirmed waitlist guests" },
    { icon: "✦", text: "Zë dispatch — quiet correspondence. No noise. Just what matters." },
    { icon: "✦", text: "We'll be in touch. Watch this space." },
];

const schema = z.object({
    name: z.string().trim().min(2, "Please enter your full name").max(100),
    email: z.string().trim().email("A valid email is required").max(255),
    city: z.string().trim().max(80).optional().or(z.literal("")),
});

interface WaitlistModalProps {
    open: boolean;
    onClose: () => void;
}

export const WaitlistModal = ({ open, onClose }: WaitlistModalProps) => {
    const [submitting, setSubmitting] = useState(false);
    const [confirmation, setConfirmation] = useState<{ code: string; name: string } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            setTimeout(() => { setConfirmation(null); setErrors({}); }, 400);
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        const fd = new FormData(e.currentTarget);
        const data = {
            name: String(fd.get("name") ?? ""),
            email: String(fd.get("email") ?? ""),
            city: String(fd.get("city") ?? ""),
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
            const code = `ZE-WL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
            const res = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ intent: "waitlist", code, ...parsed.data }),
            });
            if (!res.ok) throw new Error("Server error");
            setConfirmation({ code, name: parsed.data.name });
            toast.success("You're on the waitlist. We'll be in touch.");
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none"
                    >
                        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-ink text-paper pointer-events-auto grid md:grid-cols-2">

                            {/* Close */}
                            <button
                                onClick={onClose}
                                className="absolute top-5 right-5 z-10 text-paper/40 hover:text-paper transition-colors text-[10px] tracking-[0.2em] uppercase"
                            >
                                Close ✕
                            </button>

                            {/* Left — Benefits */}
                            <div className="p-8 md:p-12 bg-paper/[0.03] border-r border-paper/10 flex flex-col justify-between">
                                <div>
                                    <p className="text-[10px] tracking-[0.25em] uppercase text-champagne">14 · 08 · 2026</p>
                                    <h2 className="mt-4 font-serif text-4xl md:text-5xl leading-[0.95]">
                                        Join the<br />
                                        <em className="text-rose">waitlist.</em>
                                    </h2>
                                    <p className="mt-4 text-[10px] tracking-[0.15em] uppercase text-paper/50">Abuja, Nigeria</p>

                                    <div className="mt-10 space-y-4">
                                        {benefits.map((b) => (
                                            <div key={b.text} className="flex items-start gap-4">
                                                <span className="text-champagne text-[10px] mt-1 flex-shrink-0">{b.icon}</span>
                                                <span className="text-paper/70 text-sm leading-relaxed">{b.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <p className="mt-10 pt-8 border-t border-paper/10 text-xs text-paper/30 leading-relaxed font-serif italic">
                                    No spam. We'll only reach out when it matters.
                                </p>
                            </div>

                            {/* Right — Form or Confirmation */}
                            <div className="p-8 md:p-12">
                                <AnimatePresence mode="wait">
                                    {confirmation ? (
                                        <motion.div
                                            key="conf"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.6 }}
                                        >
                                            <p className="text-[10px] tracking-[0.25em] uppercase text-champagne">You're in</p>
                                            <h3 className="mt-4 font-serif text-4xl leading-tight">
                                                Thank you,<br />
                                                <em className="text-rose">{confirmation.name.split(" ")[0]}.</em>
                                            </h3>
                                            <p className="mt-4 text-paper/60 text-sm leading-relaxed">
                                                You're on the Zë waitlist. We'll be in touch as the event approaches with priority access and updates.
                                            </p>

                                            <dl className="mt-8 space-y-3 text-sm">
                                                {[
                                                    { k: "Reference", v: confirmation.code },
                                                    { k: "Date", v: "14 · 08 · 2026" },
                                                    { k: "Location", v: "Abuja, Nigeria" },
                                                ].map(({ k, v }) => (
                                                    <div key={k} className="flex justify-between border-t border-paper/10 pt-3">
                                                        <dt className="text-paper/40 uppercase tracking-[0.15em] text-[10px]">{k}</dt>
                                                        <dd className="font-mono text-paper text-xs">{v}</dd>
                                                    </div>
                                                ))}
                                            </dl>

                                            <div className="mt-8 flex gap-4">
                                                <Button variant="ghost" size="sm" className="text-paper hover:bg-paper/10" onClick={() => setConfirmation(null)}>
                                                    ← Add another
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-paper hover:bg-paper/10" onClick={onClose}>
                                                    Close
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.form
                                            key="form"
                                            onSubmit={handleSubmit}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-8"
                                            noValidate
                                        >
                                            <div>
                                                <p className="text-[10px] tracking-[0.25em] uppercase text-champagne">Stay close</p>
                                                <h3 className="mt-3 font-serif text-3xl md:text-4xl">Be first to know.</h3>
                                            </div>

                                            <div className="space-y-6">
                                                <ModalField name="name" label="Full Name" placeholder="Yael Cohen" error={errors.name} />
                                                <ModalField name="email" type="email" label="Email" placeholder="you@studio.com" error={errors.email} />
                                                <ModalField name="city" label="City" placeholder="Abuja" error={errors.city} />
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                                                <Button type="submit" variant="champagne" size="lg" disabled={submitting} className="min-w-[180px]">
                                                    {submitting ? "Joining…" : "Join waitlist"}
                                                </Button>
                                                <p className="text-[10px] text-paper/40 leading-relaxed">
                                                    Free. No spam. Unsubscribe anytime.
                                                </p>
                                            </div>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const ModalField = ({
    name, label, type = "text", placeholder, error,
}: {
    name: string; label: string; type?: string; placeholder?: string; error?: string;
}) => (
    <label className="block">
        <span className="text-[10px] tracking-[0.15em] uppercase text-paper/40">{label}</span>
        <input
            name={name}
            type={type}
            placeholder={placeholder}
            maxLength={500}
            className="mt-2 w-full bg-transparent border-0 border-b border-paper/20 focus:border-champagne outline-none py-3 font-serif text-lg text-paper placeholder:text-paper/20 transition-colors"
        />
        {error && <span className="block mt-1 text-xs text-rose">{error}</span>}
    </label>
);