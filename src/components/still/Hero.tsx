import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";
import { useState } from "react";
import { WaitlistModal } from "./WaitlistModal";

export const Hero = () => {

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <WaitlistModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <section id="top" className="relative min-h-screen w-full overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0">
          <img
            src={hero}
            alt="Editorial portrait — STILL exhibition campaign"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/20 to-ink/90" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Top meta */}
          <div className="pt-28 md:pt-36 px-6 md:px-12 max-w-[1600px] mx-auto w-full flex justify-between text-[10px] tracking-editorial uppercase text-paper/70">
            <span>Vol. I — MMXXVI</span>
            <span className="hidden md:inline">X · Abuja · Nigeria</span>
            <span>An Exhibition</span>
          </div>

          {/* Title block */}
          <div className="flex-1 flex items-center px-6 md:px-12 max-w-[1600px] mx-auto w-full">
            <div className="max-w-4xl">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-[11px] tracking-editorial uppercase text-champagne mb-8"
              >
                ZË presents
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, delay: 0.4 }}
                className="font-serif text-[14vw] md:text-[14vw] lg:text-[120px] leading-[0.85] tracking-tighter text-balance"
              >
                LIVING MANNEQUIN EVENT<span className="text-rose">.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9 }}
                className="mt-8 max-w-xl text-base md:text-lg text-paper/80 font-light leading-relaxed"
              >
                An immersive exhibition where fashion meets art -a single evening of living
                form, creative expression, and intentional presence.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="mt-12 flex flex-wrap gap-3 md:gap-4"
              >
                <Button asChild variant="champagne" size="lg">
                  <a href="#waitlist">Get your ticket</a>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-paper/40 text-paper hover:bg-paper hover:text-ink">
                  <a href="#sponsor">Become a Sponsor</a>
                </Button>
                <Button variant="ghost" size="lg" className="text-paper hover:bg-paper/10" onClick={() => setModalOpen(true)}>
                  Join the Waitlist
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Bottom meta */}
          <div className="pb-10 md:pb-12 px-6 md:px-12 max-w-[1600px] mx-auto w-full flex justify-between items-end text-[10px] tracking-editorial uppercase text-paper/60">
            <div>
              <div className="text-paper/40">Opening Night</div>
              <div className="mt-1 text-paper">14 · 09 · 2026</div>
            </div>
            <a href="#story" className="hidden md:flex items-center gap-3 hover:text-paper transition-colors">
              Scroll
              <span className="block h-px w-16 bg-paper/50" />
            </a>
          </div>
        </div>
      </section>
    </>
  );

};
