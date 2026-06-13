import { useEffect, useMemo, useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/lib/mock/types";
import { DietaryBadge } from "@/components/common/DietaryBadge";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import { buildLineFromSelections, useCart, validateRequired } from "@/lib/store/cart";
import { formatRs } from "@/lib/format";
import { flyToCart } from "@/lib/fly-to-cart";
import { haptic } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function ItemCustomizerSheet({
  item,
  open,
  onOpenChange,
  triggerElement,
}: {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  triggerElement?: HTMLElement | null;
}) {
  const addLine = useCart((s) => s.addLine);
  const [variantId, setVariantId] = useState<string | undefined>();
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && item) {
      setVariantId(item.variants?.[0]?.id);
      // pre-select first option for required single-select groups for friendliness?
      // Leave required groups empty so users must choose, except size-like single requireds remain user-driven.
      setSelections({});
      setQty(1);
      setNotes("");
    }
  }, [open, item]);

  const valid = useMemo(
    () => (item ? validateRequired(item.modifierGroups, selections) : false),
    [item, selections],
  );

  const liveLine = useMemo(() => {
    if (!item) return null;
    return buildLineFromSelections(item, {
      variantId,
      modifierSelections: selections,
      qty,
      notes: notes.trim() || undefined,
    });
  }, [item, variantId, selections, qty, notes]);

  const total = liveLine ? liveLine.unitPrice * liveLine.qty : 0;

  const toggleOption = (groupId: string, optionId: string, multi: boolean, max: number) => {
    setSelections((prev) => {
      const cur = prev[groupId] ?? [];
      const has = cur.includes(optionId);
      if (multi) {
        if (has) return { ...prev, [groupId]: cur.filter((x) => x !== optionId) };
        if (cur.length >= max) return prev;
        return { ...prev, [groupId]: [...cur, optionId] };
      }
      return { ...prev, [groupId]: [optionId] };
    });
  };

  const handleAdd = () => {
    if (!item || !valid) return;
    const build = buildLineFromSelections(item, {
      variantId,
      modifierSelections: selections,
      qty,
      notes: notes.trim() || undefined,
    });
    const res = addLine(item, build);
    if (res === "added") {
      haptic(15);
      flyToCart(triggerElement, item.image);
      toast.success(`Added ${item.name}`, { duration: 1500 });
      onOpenChange(false);
    }
    // conflict handled by CartConflictDialog mounted globally
  };

  return (
    <DrawerPrimitive.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DrawerPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[92vh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[28px] bg-background shadow-sheet outline-none sm:max-w-[520px]"
        >
          <DrawerPrimitive.Title className="sr-only">{item?.name ?? "Customize"}</DrawerPrimitive.Title>
          {item && (
            <>
              {/* Hero image */}
              <div className="relative h-[42vh] w-full shrink-0 overflow-hidden bg-surface-2">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
                <button
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                  className="tap absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md transition active:scale-90"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/70" />
              </div>

              {/* Scrollable body */}
              <div className="-mt-6 flex-1 overflow-y-auto rounded-t-[24px] bg-background px-5 pb-40 pt-5">
                <div className="flex items-start gap-2">
                  <DietaryBadge diet={item.diet} />
                  <h2 className="flex-1 font-display text-2xl font-extrabold leading-tight">
                    {item.name}
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>

                {item.variants && item.variants.length > 0 && (
                  <Section title="Choose size" required>
                    <div className="-mx-1 flex flex-wrap gap-2">
                      {item.variants.map((v) => {
                        const active = variantId === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => setVariantId(v.id)}
                            className={cn(
                              "tap h-11 rounded-full border px-4 text-sm font-semibold transition",
                              active
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-border bg-surface text-foreground",
                            )}
                          >
                            {v.name} · {formatRs(v.price)}
                          </button>
                        );
                      })}
                    </div>
                  </Section>
                )}

                {(item.modifierGroups ?? []).map((g) => {
                  const picks = selections[g.id] ?? [];
                  const met = picks.length >= g.min && picks.length <= g.max;
                  const multi = g.max > 1;
                  return (
                    <Section
                      key={g.id}
                      title={g.name}
                      required={g.required}
                      meta={
                        g.required ? (
                          met ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                              <Check className="h-3 w-3" strokeWidth={3} /> Met
                            </span>
                          ) : (
                            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                              Pick {g.min}
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {multi ? `Up to ${g.max}` : "Pick one"}
                          </span>
                        )
                      }
                    >
                      <div className="space-y-2">
                        {g.options.map((o) => {
                          const active = picks.includes(o.id);
                          return (
                            <button
                              key={o.id}
                              onClick={() => toggleOption(g.id, o.id, multi, g.max)}
                              className={cn(
                                "tap flex w-full items-center gap-3 rounded-2xl border bg-surface px-4 py-3 text-left transition",
                                active ? "border-primary bg-primary-soft/40" : "border-border",
                              )}
                            >
                              <span
                                className={cn(
                                  "grid h-5 w-5 shrink-0 place-items-center border-[1.5px] transition",
                                  multi ? "rounded-[6px]" : "rounded-full",
                                  active
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-surface",
                                )}
                              >
                                {active && <Check className="h-3 w-3" strokeWidth={3.5} />}
                              </span>
                              <span className="flex-1 text-sm font-medium">{o.name}</span>
                              {o.price > 0 && (
                                <span className="text-sm font-semibold text-muted-foreground">
                                  + {formatRs(o.price)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </Section>
                  );
                })}

                <Section title="Kitchen note">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special request for the kitchen?"
                    rows={2}
                    className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
                  />
                </Section>
              </div>

              {/* Sticky footer */}
              <div className="safe-pb absolute inset-x-0 bottom-0 border-t border-border bg-background/95 px-5 pt-3 backdrop-blur-xl">
                <div className="flex items-center gap-3 pb-3">
                  <QuantityStepper value={qty} onChange={setQty} size="lg" />
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={!valid}
                    onClick={handleAdd}
                    className="tap flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground shadow-pill transition disabled:opacity-50 disabled:shadow-none"
                  >
                    <span>{valid ? "Add to cart" : "Pick required options"}</span>
                    {valid && (
                      <>
                        <span className="opacity-60">·</span>
                        <span>{formatRs(total)}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}

function Section({
  title,
  required,
  meta,
  children,
}: {
  title: string;
  required?: boolean;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h3 className="font-display text-base font-bold">{title}</h3>
          {required && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Required
            </span>
          )}
        </div>
        {meta}
      </div>
      {children}
    </section>
  );
}
