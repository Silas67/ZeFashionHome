const words = ["LIVING MANNEQUIN", "·", "ZË", "·", "Fashion × Creativity", "·", "MMXXVI", "·"];


export const Marquee = () => {
  const row = [...words, ...words, ...words, ...words];
  return (
    <div className="bg-ink text-paper py-6 md:py-8 overflow-hidden border-y border-paper/10">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...row, ...row].map((w, i) => (
          <span
            key={i}
            className={`mx-6 font-serif text-3xl md:text-5xl ${w === "·" ? "text-rose" : "text-paper"
              }`}
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
};
