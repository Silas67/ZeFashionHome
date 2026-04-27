import { useEffect } from "react";
import { Nav } from "@/components/still/Nav";
import { Hero } from "@/components/still/Hero";
import { Story } from "@/components/still/Story";
import { Marquee } from "@/components/still/Marquee";
import { Waitlist } from "@/components/still/Waitlist";
import { Sponsor } from "@/components/still/Sponsor";
import { SocialProof } from "@/components/still/SocialProof";
import { Countdown } from "@/components/still/Countdown";
import { Footer } from "@/components/still/Footer";

const Index = () => {
  useEffect(() => {
    document.title = "STILL — Ahava Yoffi · Fashion × Creativity Exhibition";
    const meta = document.querySelector('meta[name="description"]') ?? document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute(
      "content",
      "STILL — an immersive fashion × creativity exhibition by Ahava Yoffi. Reserve your place on the waitlist or partner with us."
    );
    document.head.appendChild(meta);

    // Reveal-on-scroll
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <main className="bg-paper text-ink">
      <Nav />
      <Hero />
      <Marquee />
      <Story />
      <Countdown />
      <Waitlist />
      <SocialProof />
      <Sponsor />
      <Footer />
    </main>
  );
};

export default Index;
