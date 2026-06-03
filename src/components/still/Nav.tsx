import { useEffect, useState } from "react";

const links = [
  { href: "#story", label: "Story" },
  { href: "#waitlist", label: "Waitlist" },
  { href: "#sponsor", label: "Sponsor" },
  { href: "#countdown", label: "The Date" },
];

export const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ${scrolled ? "bg-paper/85 backdrop-blur-md border-b border-ink/10" : "bg-transparent"
        }`}
    >
      <nav className="max-w-[1600px] mx-auto px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
        <a href="#top" className="font-serif text-xl md:text-3xl tracking-luxe text-ink">
          ZË
        </a>
        <ul className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-[11px] uppercase tracking-editorial text-ink/70 hover:text-ink transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#waitlist"
          className="text-[11px] uppercase tracking-editorial border-b border-ink/40 hover:border-ink pb-1 text-ink"
        >
          Reserve
        </a>
      </nav>
    </header>
  );
};
