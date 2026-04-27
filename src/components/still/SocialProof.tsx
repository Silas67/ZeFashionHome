const press = ["VOGUE", "DAZED", "NUMÉRO", "AnOther", "i-D", "WALLPAPER*", "032c", "PURPLE"];

const quotes = [
  {
    q: "A rare moment where Tel Aviv breathes the same air as Paris and Milan.",
    a: "— Numéro",
  },
  {
    q: "Yoffi has built a language of restraint that the industry has been waiting for.",
    a: "— AnOther Magazine",
  },
  {
    q: "Stillness, rendered as spectacle.",
    a: "— Wallpaper*",
  },
];

export const SocialProof = () => {
  return (
    <section className="bg-paper text-ink py-24 md:py-32 border-t border-ink/10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <p className="text-center text-[11px] tracking-editorial uppercase text-ink/50">
          As featured in
        </p>
        <div className="mt-10 flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {press.map((p) => (
            <span
              key={p}
              className="font-serif text-xl md:text-2xl tracking-luxe text-ink/60 hover:text-ink transition-colors"
            >
              {p}
            </span>
          ))}
        </div>

        <div className="hairline mt-20 mb-16" />

        <div className="grid md:grid-cols-3 gap-12 md:gap-16">
          {quotes.map((q, i) => (
            <figure key={i} className="space-y-6">
              <div className="text-rose font-serif text-5xl leading-none">"</div>
              <blockquote className="font-serif text-2xl md:text-3xl leading-snug text-ink text-balance">
                {q.q}
              </blockquote>
              <figcaption className="text-[11px] tracking-editorial uppercase text-ink/50">
                {q.a}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
