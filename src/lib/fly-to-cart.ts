/**
 * Fly-to-cart helper. Emits a custom event with the source rect + image,
 * which the global <FlyToCartLayer/> renders and animates to the cart pill.
 */

export type FlyEventDetail = {
  src: string;
  rect: { top: number; left: number; width: number; height: number };
};

export function flyToCart(el: HTMLElement | null | undefined, imageSrc: string) {
  if (!el || typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const r = el.getBoundingClientRect();
  const detail: FlyEventDetail = {
    src: imageSrc,
    rect: { top: r.top, left: r.left, width: r.width, height: r.height },
  };
  window.dispatchEvent(new CustomEvent("dineq:fly", { detail }));
}
