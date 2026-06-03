const press = ["VOGUE", "DAZED", "NUMÉRO", "AnOther", "i-D", "WALLPAPER*", "032c", "PURPLE"];

const quotes = [
  {
    q: "Fashion fades, only style remains the same.",
    a: "— Coco Chanel",
  },
  {
    q: "Elegance is not standing out, but being remembered.",
    a: "— Giorgio Armani",
  },
  {
    q: "Luxury must be comfortable, otherwise it is not luxury.",
    a: "— Coco Chanel",
  },
];

export const SocialProof = () => {
  return (
    <section className="bg-paper text-ink py-24 md:py-32 border-t border-ink/10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">

        <div className="mt-10 text-center text-4xl md:text-5xl font-serif ">
          This is a space for creativity to be seen. <span className="italic block text-rose" >— ZË</span>
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
    </section >
  );
};
