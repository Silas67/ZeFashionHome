import storyImg from "@/assets/story-still.jpg";

export const Story = () => {
  return (
    <section id="story" className="relative bg-paper text-ink py-28 md:py-44">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12 md:gap-16 items-center">
        <div className="md:col-span-5 md:col-start-1 order-2 md:order-1">
          <img
            src={storyImg}
            alt="Sculpted drapery on marble pedestal"
            loading="lazy"
            width={1080}
            height={1600}
            className="w-full h-auto object-cover shadow-[var(--shadow-editorial)]"
          />
        </div>

        <div className="md:col-span-6 md:col-start-7 order-1 md:order-2">
          <p className="text-[11px] tracking-editorial uppercase text-rose mb-8">— Chapter One</p>
          <h2 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight text-balance">
            A study in

            <br />
            <em className="text-rose">living form.</em>
          </h2>
          <div className="hairline my-10 max-w-[120px]" />
          <div className="space-y-6 text-ink-soft text-lg font-light leading-relaxed max-w-xl">
            <p>
              <span className="font-serif text-2xl text-ink">ZE</span> — a Nigerian creative platform founded on the belief that fashion is not just
              worn, but embodied- presents its debut exhibition. An evening curated as a slow choreography between garment
              and gesture, art and atmosphere.

            </p>
            <p>
              Designers. Artists. Performers. One gallery space. A single night to witness the tension
              between movement and pause, fabric and form, intention and expression.

            </p>
            <p className="text-ink">
              This is not a runway. <em className="text-rose">This is the moment creativity becomes visible.</em>
            </p>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            {[
              { k: "CREATIVES", v: "20" },
              { k: "INSTALLATIONS", v: "08" },
              { k: "HOURS", v: "06" },
            ].map((m) => (
              <div key={m.k}>
                <dt className="text-[10px] tracking-editorial uppercase text-ink/50">{m.k}</dt>
                <dd className="font-serif text-4xl mt-1">{m.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};
