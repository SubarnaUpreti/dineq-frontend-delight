import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { FlyEventDetail } from "@/lib/fly-to-cart";

type Flight = FlyEventDetail & { id: number };

export function FlyToCartLayer() {
  const [flights, setFlights] = useState<Flight[]>([]);
  useEffect(() => {
    let n = 0;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<FlyEventDetail>).detail;
      const id = ++n;
      setFlights((f) => [...f, { ...detail, id }]);
      setTimeout(() => setFlights((f) => f.filter((x) => x.id !== id)), 900);
    };
    window.addEventListener("dineq:fly", handler);
    return () => window.removeEventListener("dineq:fly", handler);
  }, []);

  const target = typeof document !== "undefined" ? document.getElementById("cart-pill-target") : null;
  const tRect = target?.getBoundingClientRect();
  const targetX = tRect ? tRect.left + tRect.width / 2 - 28 : window.innerWidth / 2 - 28;
  const targetY = tRect ? tRect.top + tRect.height / 2 - 28 : window.innerHeight - 120;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <AnimatePresence>
        {flights.map((f) => (
          <motion.img
            key={f.id}
            src={f.src}
            initial={{
              top: f.rect.top,
              left: f.rect.left,
              width: f.rect.width,
              height: f.rect.height,
              borderRadius: 16,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              top: targetY,
              left: targetX,
              width: 56,
              height: 56,
              borderRadius: 999,
              opacity: 0.2,
              rotate: 220,
            }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="absolute object-cover shadow-pop"
            style={{ position: "fixed" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
