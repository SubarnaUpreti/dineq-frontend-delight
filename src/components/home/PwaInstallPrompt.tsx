import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, X } from "lucide-react";

const KEY = "dineq.pwa-dismissed";

export function PwaInstallPrompt() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(KEY);
    if (dismissed) return;
    // show after a short delay so the home page settles first
    const t = setTimeout(() => setShow(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY, "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="mx-4 mt-2 rounded-2xl border border-border bg-card p-3 shadow-card"
        >
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">Install DineQ on your phone</p>
              <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                Add to home screen for a faster, app-like experience.
              </p>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="tap -mr-1 -mt-1 grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-surface-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
