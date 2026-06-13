import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PROMOS = [
  {
    id: "1",
    title: "10% off your\nfirst order",
    sub: "Use code DINEQ10 at checkout",
    bg: "linear-gradient(120deg, oklch(0.7 0.18 50), oklch(0.65 0.22 25))",
    emoji: "🔥",
  },
  {
    id: "2",
    title: "Free almond\ncroissant",
    sub: "On any coffee order over Rs. 300",
    bg: "linear-gradient(120deg, oklch(0.55 0.13 250), oklch(0.7 0.14 200))",
    emoji: "🥐",
  },
  {
    id: "3",
    title: "Late-night\nbites",
    sub: "Pickup till midnight from 12 spots",
    bg: "linear-gradient(120deg, oklch(0.4 0.12 290), oklch(0.55 0.18 320))",
    emoji: "🌙",
  },
];

export function PromoCarousel() {
  const [ref, embla] = useEmblaCarousel({ loop: true, align: "start", containScroll: "trimSnaps" });
  const [sel, setSel] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSel = () => setSel(embla.selectedScrollSnap());
    embla.on("select", onSel);
    onSel();
    const id = setInterval(() => embla?.scrollNext(), 4500);
    return () => {
      embla.off("select", onSel);
      clearInterval(id);
    };
  }, [embla]);

  return (
    <div>
      <div ref={ref} className="overflow-hidden">
        <div className="flex gap-3 pl-4 pr-2">
          {PROMOS.map((p) => (
            <motion.div
              key={p.id}
              whileTap={{ scale: 0.98 }}
              className="relative aspect-[16/8] w-[88%] shrink-0 overflow-hidden rounded-3xl p-5 text-white shadow-card"
              style={{ background: p.bg }}
            >
              <div className="absolute -right-4 -top-3 text-[112px] leading-none opacity-20">
                {p.emoji}
              </div>
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  Special offer
                </p>
                <h3 className="mt-1 whitespace-pre-line font-display text-2xl font-extrabold leading-[1.05]">
                  {p.title}
                </h3>
                <p className="mt-2 text-xs opacity-90">{p.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {PROMOS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === sel ? "w-5 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
