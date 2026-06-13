import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PROMOS = [
  {
    id: "1",
    eyebrow: "First order",
    title: "10% off,\non us",
    sub: "Code DINEQ10 at checkout · up to Rs. 200",
    bg: "linear-gradient(135deg, oklch(0.32 0.06 50) 0%, oklch(0.22 0.03 50) 100%)",
    accent: "oklch(0.78 0.16 60)",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&auto=format&q=80",
  },
  {
    id: "2",
    eyebrow: "Brunch club",
    title: "Free almond\ncroissant",
    sub: "With any coffee order over Rs. 300",
    bg: "linear-gradient(135deg, oklch(0.28 0.04 200) 0%, oklch(0.2 0.03 220) 100%)",
    accent: "oklch(0.78 0.12 200)",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=400&fit=crop&auto=format&q=80",
  },
  {
    id: "3",
    eyebrow: "Late night",
    title: "Open till\nmidnight",
    sub: "12 spots ready when you are",
    bg: "linear-gradient(135deg, oklch(0.28 0.06 300) 0%, oklch(0.2 0.04 320) 100%)",
    accent: "oklch(0.78 0.14 320)",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&auto=format&q=80",
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
              className="relative aspect-[16/8] w-[88%] shrink-0 overflow-hidden rounded-3xl shadow-card"
              style={{ background: p.bg }}
            >
              <img
                src={p.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-luminosity"
              />
              <div
                className="absolute inset-0"
                style={{ background: p.bg, opacity: 0.55 }}
              />
              <div className="relative flex h-full flex-col justify-between p-5 text-white">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: p.accent }}
                  />
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-90">
                    {p.eyebrow}
                  </p>
                </div>
                <div>
                  <h3 className="whitespace-pre-line font-display text-[26px] font-extrabold leading-[1.02] tracking-tight">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-[11.5px] font-medium opacity-85">{p.sub}</p>
                </div>
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
