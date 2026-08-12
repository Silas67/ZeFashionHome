import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EVENT, EVENT_LOCATION } from "@/lib/event";

const WORKER_URL = "https://ze-mailer.houseofze.workers.dev";

/** Public-safe subset of a signup — no email, phone or note is ever returned. */
type Pass = {
    name: string;
    tier?: string;
    code: string;
};

const TIER_LABELS: Record<string, string> = {
    general: "General",
    vip: "VIP",
    exhibitor: "Creatives",
    sponsor: "Sponsor",
};

const TARGET = new Date(EVENT.startsAt);

const calc = () => {
    const diff = Math.max(0, TARGET.getTime() - Date.now());
    return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        elapsed: diff === 0,
    };
};

/** Builds an .ics file in-browser so "Add to calendar" needs no backend. */
const calendarHref = (code: string) => {
    const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const start = new Date(EVENT.startsAt);
    const end = new Date(start.getTime() + 6 * 3600000);
    const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Ze Creative//Living Mannequin//EN",
        "BEGIN:VEVENT",
        `UID:${code}@houseofze.com`,
        `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(start)}`,
        `DTEND:${stamp(end)}`,
        `SUMMARY:${EVENT.brand} — ${EVENT.name}`,
        `LOCATION:${EVENT_LOCATION}`,
        `DESCRIPTION:Your pass code is ${code}. Present this at the entrance.`,
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
};

export const Pass = () => {
    const { code } = useParams<{ code: string }>();
    const [pass, setPass] = useState<Pass | null>(null);
    const [state, setState] = useState<"loading" | "ok" | "missing" | "error">("loading");
    const [t, setT] = useState(calc);

    useEffect(() => {
        const id = setInterval(() => setT(calc()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (!code) return;
        document.title = `${EVENT.brand} · Pass ${code}`;
        (async () => {
            try {
                const res = await fetch(`${WORKER_URL}/pass?code=${encodeURIComponent(code)}`);
                if (res.status === 404) { setState("missing"); return; }
                if (!res.ok) { setState("error"); return; }
                setPass(await res.json() as Pass);
                setState("ok");
            } catch {
                setState("error");
            }
        })();
    }, [code]);

    if (state !== "ok" || !pass) {
        return (
            <div className="min-h-screen bg-[#0e0e0e] text-[#f0ede6] flex items-center justify-center px-6">
                <div className="text-center max-w-sm">
                    <p className="text-[11px] tracking-[0.25em] uppercase text-[#c9a96e]">
                        {EVENT.brand} · {EVENT.name}
                    </p>
                    <h1 className="mt-6 font-serif text-4xl">
                        {state === "loading" ? "Loading your pass…" :
                            state === "missing" ? "Pass not found." : "Something went wrong."}
                    </h1>
                    {state === "missing" && (
                        <p className="mt-4 text-sm text-[#f0ede6]/50 leading-relaxed">
                            This pass code isn't recognised. Check the link in your confirmation
                            email, or reply to it and our team will help.
                        </p>
                    )}
                    {state === "error" && (
                        <p className="mt-4 text-sm text-[#f0ede6]/50">Please try again in a moment.</p>
                    )}
                </div>
            </div>
        );
    }

    const firstName = pass.name.split(" ")[0];
    const tierLabel = TIER_LABELS[pass.tier ?? ""] ?? pass.tier;

    return (
        <div className="min-h-screen bg-[#0e0e0e] text-[#f0ede6] px-6 py-14 flex justify-center">
            <div className="w-full max-w-md">

                <p className="text-[11px] tracking-[0.25em] uppercase text-[#c9a96e]">
                    {EVENT.brand} · {EVENT.name}
                </p>

                <h1 className="mt-8 font-serif text-5xl leading-[0.95]">
                    Welcome,<br />
                    <em className="text-[#c9a96e]">{firstName}.</em>
                </h1>

                <p className="mt-5 text-sm text-[#f0ede6]/55 leading-relaxed">
                    This is your pass. Present this screen at the entrance on the night.
                </p>

                {/* Countdown */}
                <div className="mt-10 grid grid-cols-3 gap-px bg-[#f0ede6]/10">
                    {[
                        { label: "Days", value: t.days },
                        { label: "Hours", value: t.hours },
                        { label: "Minutes", value: t.minutes },
                    ].map((it) => (
                        <div key={it.label} className="bg-[#0e0e0e] py-5 text-center">
                            <div className="font-serif text-4xl tabular-nums leading-none">
                                {String(it.value).padStart(2, "0")}
                            </div>
                            <div className="mt-2 text-[9px] uppercase tracking-[0.2em] text-[#f0ede6]/40">
                                {it.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Details */}
                <dl className="mt-10 text-sm">
                    {[
                        { k: "Pass", v: pass.code, mono: true },
                        { k: "Tier", v: tierLabel ?? "—" },
                        { k: "Date", v: EVENT.dateEmail },
                        { k: "Doors", v: EVENT.doors },
                        { k: "Location", v: EVENT_LOCATION },
                        { k: "Venue", v: EVENT.venue },
                    ].map(({ k, v, mono }) => (
                        <div key={k} className="flex justify-between gap-6 border-t border-[#f0ede6]/10 py-3">
                            <dt className="text-[10px] uppercase tracking-[0.2em] text-[#f0ede6]/40 pt-1">{k}</dt>
                            <dd className={`text-right ${mono ? "font-mono text-[#c9a96e]" : "text-[#f0ede6]"}`}>{v}</dd>
                        </div>
                    ))}
                </dl>

                {/* Actions */}
                <div className="mt-10 space-y-3">
                    <a
                        href={calendarHref(pass.code)}
                        download={`ze-living-mannequin.ics`}
                        className="block w-full py-4 bg-[#c9a96e] text-[#0e0e0e] text-center text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-[#f0ede6] transition-colors"
                    >
                        Add to calendar
                    </a>
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT_LOCATION)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-4 border border-[#f0ede6]/20 text-center text-[11px] tracking-[0.2em] uppercase text-[#f0ede6]/70 hover:border-[#f0ede6]/50 hover:text-[#f0ede6] transition-colors"
                    >
                        Directions
                    </a>
                    <a
                        href="https://www.instagram.com/ze.thebrand"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-4 border border-[#f0ede6]/20 text-center text-[11px] tracking-[0.2em] uppercase text-[#f0ede6]/70 hover:border-[#f0ede6]/50 hover:text-[#f0ede6] transition-colors"
                    >
                        @ze.thebrand
                    </a>
                </div>

                <p className="mt-10 pt-6 border-t border-[#f0ede6]/10 text-[10px] tracking-[0.1em] text-[#f0ede6]/25">
                    © Zë Creative · Entry is free, by pass only.
                </p>
            </div>
        </div>
    );
};
