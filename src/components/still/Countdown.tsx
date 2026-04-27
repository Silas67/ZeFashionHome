import { useEffect, useState } from "react";

const TARGET = new Date("2026-09-14T19:00:00");

const calc = () => {
  const diff = Math.max(0, TARGET.getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
};

export const Countdown = () => {
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  const items = [
    { label: "Days", value: t.days },
    { label: "Hours", value: t.hours },
    { label: "Minutes", value: t.minutes },
    { label: "Seconds", value: t.seconds },
  ];

  return (
    <section id="countdown" className="relative py-28 md:py-40 bg-paper-deep text-ink overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
        <p className="text-[11px] tracking-editorial uppercase text-rose">Save the date</p>
        <h2 className="mt-6 font-serif text-5xl md:text-8xl leading-none tracking-tight">
          14 · September · 2026
        </h2>
        <p className="mt-6 text-ink/60 tracking-luxe text-xs uppercase">
          Hangar 11 · Tel Aviv Port · Doors 19:00
        </p>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-2 max-w-4xl mx-auto">
          {items.map((it) => (
            <div key={it.label} className="border-t border-ink/20 pt-6">
              <div className="font-serif text-6xl md:text-8xl tabular-nums leading-none">
                {String(it.value).padStart(2, "0")}
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-editorial text-ink/50">
                {it.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
