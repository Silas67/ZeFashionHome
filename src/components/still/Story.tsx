import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import storyImg from "@/assets/story-still.jpg";
import storyImg2 from "@/assets/story5.jpg";
import storyImg3 from "@/assets/story3.jpg";
import storyImg4 from "@/assets/story6.jpg";
import storyImg5 from "@/assets/story4.jpg";
import storyImg6 from "@/assets/story7.jpg";

const slides = [storyImg, storyImg2, storyImg3, storyImg4, storyImg5, storyImg6];

export const Story = () => {
  return (
    <section id="story" className="w-full relative bg-paper text-ink py-16 md:py-44 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-8 md:gap-16 items-center">

        {/* Text */}
        <div className="w-full min-w-0 md:col-span-6 md:col-start-7 order-1 md:order-2">
          <p className="text-[11px] tracking-editorial uppercase text-rose mb-6 md:mb-8">— Chapter One</p>
          <h2 className="font-serif text-4xl md:text-7xl leading-[0.95] tracking-tight">
            A study in
            <br />
            <em className="text-rose">living form.</em>
          </h2>
          <div className="hairline my-8 md:my-10 max-w-[120px]" />
          <div className="space-y-5 text-ink-soft text-base md:text-lg font-light leading-relaxed">
            <p className="break-words">
              <span className="font-serif text-xl md:text-2xl text-ink">ZË</span> — a Nigerian creative platform founded on the belief that fashion is not just worn, but embodied — presents its debut exhibition. An evening curated as a slow choreography between garment and gesture, art and atmosphere.
            </p>
            <p className="break-words">
              Designers. Artists. Performers. One gallery space. A single night to witness the tension between movement and pause, fabric and form, intention and expression.
            </p>
            <p className="text-ink break-words">
              This is not a runway. <em className="text-rose">This is the moment creativity becomes visible.</em>
            </p>
          </div>

          <dl className="mt-10 md:mt-12 grid grid-cols-3 gap-4 md:gap-6">
            {[
              { k: "CREATIVES", v: "20" },
              { k: "INSTALLATIONS", v: "08" },
              { k: "HOURS", v: "06" },
            ].map((m) => (
              <div key={m.k}>
                <dt className="text-[10px] tracking-editorial uppercase text-ink/50">{m.k}</dt>
                <dd className="font-serif text-3xl md:text-4xl mt-1">{m.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Slider */}
        <div className="w-full min-w-0 md:col-span-5 md:col-start-1 order-2 md:order-1">
          <div className="relative overflow-hidden shadow-[var(--shadow-editorial)]">
            <Swiper
              modules={[Autoplay, EffectFade]}
              effect="fade"
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              loop
              speed={1200}
              className="w-full h-[300px] md:h-[500px]"
            >
              {slides.map((img, i) => (
                <SwiperSlide key={i}>
                  <img
                    src={img}
                    alt={`Zë exhibition ${i + 1}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 pointer-events-none">
              {slides.map((_, i) => (
                <span key={i} className="block w-1 h-1 rounded-full bg-paper/60" />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};