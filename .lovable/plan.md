# DineQ — Full Frontend Overhaul Plan

## Brutal review of the current app

**Homepage**
- Greeting "HI AARAV 👋" + "What sounds good?" is fine, but the search bar is generic shadcn (thin border, low contrast). Doesn't feel premium.
- Promo carousel is loud orange-gradient + flame icon — looks like a template banner, not a brand asset. Dots indicator is tiny and low-contrast.
- Filter chips and category grid are functional but visually flat; emoji-style category tiles look childish for a "mature" product.
- Restaurant cards are too tall (huge image + lots of padding). On a 390-wide phone you see ~1.5 cards per viewport — slow to browse.
- "PICKUP / DINE-IN" pill badges are shouting (uppercase, two colors). Real apps use one subtle tag.
- Rating, time, distance line is cramped; rating pill is green-on-green and visually heavy.
- Footer "Made with care · DineQ" wastes a tap-target zone and there's no end-of-list state.

**Bottom navigation**
- 5 tabs (Home, Orders, Cart, Favorites, Profile) is one too many — Cart is the #1 offender because it duplicates the cart pill and steals a tab slot.
- The bar uses solid white with a top border — no blur, no elevation, sits flat on photo content.
- Active state is a small dot under the label — easy to miss.
- **Critical:** the bar overlaps content (we already saw it clipping the + buttons on the menu). Padding is being added per-route instead of globally.

**Restaurant page**
- Hero image is huge (>40vh), pushes the menu way down. Real apps cap at ~28vh and overlay info.
- Info card floats over the hero awkwardly and stacks badges (Nepali / Tibetan / Asian / PICKUP / DINE-IN) into a messy second row.
- Category tab strip ("Popular / Steamed Momo / Fried Momo / Sides") is fine but doesn't stick on scroll, so users lose context.
- Menu cards are full-width image cards — fine for "featured" but wasteful for a 20-item menu. Standard pattern is compact rows (text left, square thumbnail right).
- The orange "+" FAB on every card is visually noisy when you have 10 cards stacked.
- No section jump / sticky category nav, no search-within-restaurant.

**Item customizer sheet**
- Drawer takes 96vh now (we just bumped it) but hero image still eats a quarter of it. Modifier groups have weak hierarchy — required vs optional isn't obvious.
- Quantity + Add-to-cart CTA at the bottom is a plain button, not a sticky pay-style bar with running total.

**Cart / Checkout / Payment / Tracking**
- Cart items are plain rows, no thumbnails, no per-item notes affordance.
- Checkout is a single long form; no clear "Pickup vs Dine-in" segmented control at the top, no tip selector, no promo code slot styled like a real app.
- Payment screen is barebones; no method icons, no saved methods, no "Pay Rs X" sticky CTA.
- Order tracking has no visual timeline / progress beads — just text states.

**System-level**
- Typography: one sans (Inter/system) across everything. No display face → nothing feels branded.
- Spacing: ad-hoc — some screens use 16px gutter, some 12, some 24. No rhythm.
- Colors: orange accent is used for promo, FAB, and CTA — all at the same saturation, so nothing wins. No proper neutral surface scale.
- Empty states are text-only ("No favorites yet"). Loading states are bare shadcn skeletons.
- No micro-interactions (button press, add-to-cart bounce, tab switch). Fly-to-cart exists but the cart pill itself doesn't react.
- Many tap targets < 44px (filter chips, rating pill, share/heart buttons in restaurant header).

---

## Design direction

The standard, widely-used aesthetic for modern food-ordering apps (Uber Eats / DoorDash / Wolt / Zomato / Swiggy / Deliveroo) is:

- Light, near-white background with warm off-white surfaces
- Big, edge-to-edge food photography
- One confident warm accent (we'll keep orange but tune it)
- Strong sans display for headings, neutral sans for body
- Compact list rows for menus, hero cards only for featured/promo
- Sticky bottom CTA on action screens
- Generous 16px gutters, 12px vertical rhythm, 16/20/24 radii

**Tokens (`src/styles.css`)**

```text
--background:        oklch(0.99 0.005 60)     /* warm white */
--surface:           oklch(0.97 0.01 60)      /* card */
--surface-elevated:  oklch(1.00 0 0)
--foreground:        oklch(0.18 0.01 60)
--muted-foreground:  oklch(0.50 0.01 60)
--border:            oklch(0.92 0.005 60)
--primary:           oklch(0.69 0.19 42)      /* refined orange */
--primary-pressed:   oklch(0.62 0.20 42)
--success:           oklch(0.62 0.14 150)
--warning:           oklch(0.78 0.16 75)
--destructive:       oklch(0.58 0.22 25)
--radius-sm: 10px; --radius: 16px; --radius-lg: 20px; --radius-xl: 28px
--shadow-card: 0 1px 2px rgba(20,14,8,.04), 0 8px 24px -12px rgba(20,14,8,.08)
--shadow-float: 0 8px 24px -8px rgba(20,14,8,.18)
```

**Type**
- Display: "Plus Jakarta Sans" 700/800 for H1/H2 and prices.
- Body/UI: "Inter" 400/500/600.
- Loaded via Google Fonts link in `__root.tsx` head.
- Sizes: H1 28/34, H2 22/28, H3 18/24, body 15/22, small 13/18, micro 12/16. Tabular nums on prices.

**Spacing & radii**
- 4-pt grid, gutters 16px, section spacing 24px, card padding 14px, sticky safe-areas respect `env(safe-area-inset-bottom)`.

---

## Bottom nav: 4 tabs + floating cart

- Tabs: **Home · Orders · Favorites · Profile** (Cart removed from tabs).
- Bar: blurred translucent surface (`bg-background/80 backdrop-blur`) + 1px hairline + soft top shadow, respects safe-area.
- Active state: filled icon + label color = primary, plus 3px rounded indicator above the icon.
- 56px height, 11px label, 24px icon, ≥44px tap targets.
- **Persistent floating cart pill** (already exists as `CartPill`) anchored above the tab bar bottom-right when items > 0, with item count + total and slide-up entrance. Hidden on `/cart`, `/pay/*`.
- Global `AppShell` adds `pb-[calc(56px+env(safe-area-inset-bottom)+12px)]` to the main scroll area so no route ever needs its own bottom padding hack.

---

## Screen-by-screen rebuild

**Home (`routes/index.tsx`, `components/home/*`)**
- Sticky top bar: avatar + "Hi, Aarav" left, location chip ("Kathmandu ▾") right.
- Search: large pill input, 48px tall, soft surface, leading icon, voice icon trailing.
- Promo carousel: 16:9 cards, 90% width peek, dark gradient overlay, custom dot indicator (active = 16px bar). Cap at 3 slides.
- Categories: 4-per-row horizontal scroller of round image chips (no emoji), 64px circle + 12px label.
- Filters: horizontal chip row, segmented look, sticky under header on scroll.
- Restaurant list: compact card — 16:10 image with single status badge top-left, heart top-right, then 12px gap to a 2-line meta block (Name • cuisines • rating·time·distance row). Closed state = grayscale image + amber "Opens 5:00 PM" pill.
- End-of-list "You've seen all 8 restaurants" state.

**Restaurant (`routes/restaurant.$id.tsx`)**
- Collapsing hero: 28vh image with linear black-fade bottom; floating back/share/heart as 40px circular glass buttons.
- Info block: name + rating inline, single meta row, expandable cuisines, "Open now" dot. Remove duplicate PICKUP/DINE-IN — show service modes as one neutral chip.
- Sticky category strip under hero on scroll (`position: sticky; top: 0`) with active underline + smooth scroll-to-section.
- Menu rows: compact horizontal card — title, 2-line desc, price (tabular), veg/non-veg dot, 80×80 rounded thumbnail right, small ghost "+" button overlapping bottom-right of thumbnail (not orange FAB on every card). "Popular" badge becomes a tiny tag inline with title.
- Search-within-menu icon in sticky strip.

**Item customizer (`components/menu/ItemCustomizerSheet.tsx`)**
- Drawer 92vh, drag handle, hero 24vh capped 240px.
- Title + price big, description muted, allergen line.
- Modifier groups: clear header "Choose 1 (Required)" / "Add extras (Optional, max 3)", segmented radios for single-choice, list checkboxes for multi. Selected = filled chip.
- Special instructions textarea collapsible.
- Sticky footer: qty stepper left, "Add 2 · Rs 480" primary button right (full width split), tabular nums, haptic-ish press scale.

**Cart (`routes/cart.tsx`)**
- Grouped by restaurant. Each row: 56px thumb, name + modifier summary, qty stepper, price right-aligned (tabular).
- Inline "Add note" affordance, swipe-to-delete with confirm.
- Summary card: subtotal, taxes, total in large display weight.
- Promo code as collapsible inline row with success state.
- Sticky bottom "Checkout · Rs 1,240" primary button.
- Empty: illustration + "Your cart is empty" + CTA "Browse restaurants".

**Checkout (`routes/pay.$orderId.tsx` and pre-pay step in cart flow)**
- Top segmented control: Pickup | Dine-in (single source of truth, no separate badges).
- Pickup time selector (ASAP / schedule chips).
- Contact (name + phone) auto-filled from profile.
- Tip selector chips (0 / 5% / 10% / 15% / custom).
- Order summary collapsible.
- Sticky "Place order · Rs X" CTA.

**Payment (`routes/pay.$orderId.tsx`)**
- Method tiles with real icons (eSewa / Khalti / Card / Cash on pickup). Selected = primary border + check.
- Saved method appears at top if exists.
- Sticky "Pay Rs X" CTA, loading state replaces button content (not a modal spinner).
- Verify step: large success/processing icon, 1-line status, ghost "Go to order" CTA.

**Order tracking (`routes/orders.$id.tsx`)**
- Hero: restaurant name + order code.
- Vertical timeline of states (Placed → Accepted → Preparing → Ready for pickup → Picked up) with animated active bead, completed = check.
- ETA card with countdown.
- Itemized summary collapsible.
- Sticky bottom: "Call restaurant" + "Get directions" (for pickup).
- Orders index: cards with status pill, last-updated relative time, swipe to reorder.

**Empty / loading / error states (`components/common/*`)**
- New `EmptyState` with custom illustrations (simple line drawings on warm surface) for: no favorites, no orders, no cart, no search results, restaurant closed, network error.
- Skeletons: shimmer animation, match real card silhouettes exactly (restaurant card skeleton ≠ generic grey block).
- Toasts (sonner) restyled: warm surface, primary icon, swipe to dismiss.

**Micro-interactions**
- Buttons: `active:scale-[0.97] transition-transform` globally on primary CTAs.
- Add-to-cart: existing fly-to-cart kept; cart pill pulses + count rolls up.
- Tab switch: indicator slides with spring (framer-motion `layoutId`).
- Sheet/drawer: spring easing, snap points where useful.
- Heart toggle: scale-bounce on tap.

**Accessibility**
- All icon-only buttons get `aria-label`.
- Contrast checked against AA (orange CTAs use white text only on `--primary` solid).
- Min 44px tap targets enforced on chips, heart, back, +.
- Focus rings via `:focus-visible` with primary outline.

**PWA polish**
- `manifest.webmanifest` already exists; refresh name "DineQ", short_name "DineQ", theme_color = primary, background_color = background, maskable icon, `display: standalone`.
- Apple touch icon + status-bar style meta in `__root.tsx`.
- `PwaInstallPrompt` restyled to match new design language, dismissible, remembered in localStorage.
- No service worker / offline behavior added (out of scope, per skill guidance).

---

## Execution order (single overhaul, both Home and Restaurant first, then funnel)

1. **Foundations** — fonts in `__root.tsx`, tokens in `src/styles.css`, shadcn variants tightened, global `AppShell` safe-area padding, new `BottomTabBar` (4 tabs), refined `CartPill` (floating, always-on when items>0).
2. **Home + Restaurant menu + Customizer** (highest-traffic surfaces) — rebuild components listed above.
3. **Cart → Checkout → Payment → Tracking** funnel — rebuild in conversion order.
4. **Favorites, Profile, Orders index** — bring to parity.
5. **Empty / loading / error states + micro-interactions + a11y pass + PWA manifest polish**.
6. **Verify**: load every route at 390×844 in the preview, confirm no overlap with bottom bar, no hydration warnings, no console errors, tap-targets visually ≥44px.

## Guardrails (won't break existing logic)

- No changes to Zustand stores (`cart`, `orders`, `favorites`, `user`) shape, persistence, or `skipHydration` setup.
- No changes to mock data shape in `src/lib/mock/data.ts` beyond adding optional fields if needed.
- No route additions/removals; only file contents change.
- No server function changes.
- `PersistentStoreHydrator` in `AppShell` stays.
- Keep `FlyToCartLayer` behavior; only restyle target.

## Technical notes

- Fonts: Google Fonts `<link rel="stylesheet">` in `__root.tsx` head with `display=swap`. Tailwind v4 `@theme` block in `styles.css` maps `--font-display` and `--font-sans`.
- `framer-motion` is already a dep — use for tab indicator and sheet springs. No new packages required.
- Sticky category strip: native CSS `position: sticky` inside the scroll container; scroll-spy via `IntersectionObserver` hook in `src/hooks/useScrollSpy.ts` (new).
- Safe-area: single utility class `.safe-bottom { padding-bottom: calc(56px + env(safe-area-inset-bottom) + 12px); }` applied once in `AppShell`, removing per-route `pb-48` hacks.
- All color usage migrated to tokens — zero `text-white` / `bg-black` / hex literals in components.
