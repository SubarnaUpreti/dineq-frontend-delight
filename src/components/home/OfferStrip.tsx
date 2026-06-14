const OFFERS = [
  { id: "1", pct: "50% OFF", sub: "Up to ₹100", brand: "Momo House", color: "oklch(0.58 0.22 25)" },
  { id: "2", pct: "60% OFF", sub: "Use HUNGRY60", brand: "Fornello", color: "oklch(0.5 0.2 280)" },
  { id: "3", pct: "₹125 OFF", sub: "Above ₹249", brand: "Patty & Co.", color: "oklch(0.52 0.18 220)" },
  { id: "4", pct: "Free Item", sub: "On orders ₹399+", brand: "Brew Lab", color: "oklch(0.5 0.18 160)" },
];

export function OfferStrip() {
  return (
    <div>
      <h2 className="mb-3 px-4 font-display text-[18px] font-extrabold leading-tight">
        Offers for you
      </h2>
      <div className="no-scrollbar overflow-x-auto">
        <div className="flex gap-3 px-4">
          {OFFERS.map((o) => (
            <div
              key={o.id}
              className="relative h-24 w-56 shrink-0 overflow-hidden rounded-2xl p-3 text-white shadow-card"
              style={{
                background: `linear-gradient(135deg, ${o.color} 0%, oklch(0.25 0.08 30) 130%)`,
              }}
            >
              <p className="font-display text-[22px] font-black leading-none tracking-tight">
                {o.pct}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider opacity-90">
                {o.sub}
              </p>
              <p className="absolute bottom-2.5 left-3 text-[10.5px] font-semibold opacity-85">
                · {o.brand}
              </p>
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
              <div className="absolute -right-2 bottom-2 h-10 w-10 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
