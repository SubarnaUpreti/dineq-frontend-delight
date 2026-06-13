
# DineQ — Mobile-First Restaurant Pre-Ordering PWA

A premium, mobile-first customer app for pickup and dine-in ordering. Frontend only, mock data, production-quality UX. Built on the existing TanStack Start + Tailwind v4 + shadcn stack.

## Design system

A warm, appetizing food-tech palette — not generic AI purple. All tokens in `src/styles.css` under `@theme inline` + `:root`.

- Primary: warm amber/orange `oklch(0.72 0.17 55)` (CTA, prices, active states)
- Background: soft cream `oklch(0.985 0.008 80)`
- Foreground: deep charcoal `oklch(0.18 0.01 60)`
- Surface: white cards with `oklch(0.92 0.01 70)` borders and soft shadows
- Success green, error red, warning amber as semantic tokens
- Veg / Non-Veg / Egg dietary dot tokens
- Typography: Manrope (display, 600/700/800) + Inter (body, 400/500/600), loaded via `<link>` in `__root.tsx`, registered as `--font-display` / `--font-sans` in `@theme`
- Radius scale tuned for soft cards (xl = 16px, 2xl = 20px, pill for chips/buttons)
- Custom shadows: `--shadow-card`, `--shadow-pop`, `--shadow-sheet`
- Motion: short, spring-y; respect `prefers-reduced-motion`

## Tech approach

- TanStack Start file-based routes under `src/routes/`
- shadcn primitives (Sheet, Dialog, Drawer, Button, Input, Badge, Tabs, ScrollArea, Skeleton, Toaster)
- `framer-motion` for sheet, fly-to-cart, confetti, status transitions
- Cart state: Zustand store in `src/lib/store/cart.ts` with restaurant-scope conflict logic
- Favorites + mock user: small Zustand stores persisted to `localStorage`
- Mock data: `src/lib/mock/{restaurants,menus,orders,promos}.ts` with realistic names, prices in Rs., prep times, ratings, dietary flags
- Hero food imagery: generated assets in `src/assets/` (category icons + 6 restaurant covers + ~12 dish images), imported as ES6
- PWA shell: manifest + icons only (manifest-only path per PWA skill — no service worker), `PwaInstallPrompt` UI on the home screen
- Safe-area: `env(safe-area-inset-*)` paddings on shell, bottom nav, cart pill
- Accessibility: 44px tap targets, focus rings, aria labels on icon buttons, reduced-motion fallbacks

## Routes

```
src/routes/
  __root.tsx               shell, fonts, manifest links, Toaster, AppShell wrapper
  index.tsx                Home (search, promos, filters, categories, restaurant feed)
  restaurant.$id.tsx       Restaurant menu browser
  cart.tsx                 Cart + checkout (fulfillment, identity, promo, totals)
  pay.$orderId.tsx         Mock payment gateway
  pay.$orderId.verify.tsx  Verification + success celebration
  orders.index.tsx         Orders list (active + past + empty)
  orders.$id.tsx           Order tracking detail (timeline)
  favorites.tsx            Saved restaurants
  profile.tsx              Profile + settings
```

Item customizer is a global Sheet triggered from menu cards (not a route).

## Component inventory

Shell & nav
- `AppShell` — safe-area, hides bottom nav on `/cart`, `/pay/*`
- `BottomTabBar` — 5 tabs, filled active icons, primary dot indicator, spring tap
- `CartPill` — floating sticky, item count + subtotal + CTA, slides in when cart > 0
- `ActiveOrderBar` — floating above cart pill when an order is active
- `PwaInstallPrompt` — dismissible bottom card on Home

Home
- `StickySearchBar`, `PromoCarousel` (embla), `FilterChipRow`, `CategoryGrid`, `RestaurantCard`, `RestaurantFeed`

Restaurant
- `RestaurantHeader` (parallax cover), `MenuCategoryNav` (sticky, scroll-spy), `MenuSectionHeader`, `MenuItemCard` (2-col grid, image-first), `DietaryBadge`, `QuickAddButton`

Customizer
- `ItemCustomizerSheet` — hero image, variant pills, modifier groups with min/max + "✓ MET", kitchen-notes textarea, quantity stepper, dynamic Add-to-Cart total
- `CartConflictDialog` — clear-and-add vs keep

Cart / checkout
- `CartLineItem`, `FulfillmentToggle`, `IdentityForm`, `PromoCodeField`, `CostBreakdown`, `MinOrderProgress`, `CheckoutButton` (loading + idempotent)

Payment
- `MockGatewayScreen` (generic, eSewa/Khalti/Fonepay inspired — no copied branding), `VerifyingScreen` (rotating reassurance copy), `PaymentSuccess` (confetti + chime placeholder + CTA)

Orders
- `OrderCard`, `OrderStatusTimeline` (Placed → Accepted → Preparing → Ready), `OrderItemsSummary`, `HelpContactCard`

Favorites & profile
- `FavoriteRestaurantCard`, `EmptyFavorites`, `ProfileHeader`, `ProfileMenuList`, `SettingsRow`

System
- `EmptyState`, `ErrorState`, `Skeleton*` (card/list/menu), `ConfirmDialog`, sonner toasts, `FlyToCart` animation helper, `Confetti`

## Interactions & UX details

- Fly-to-cart: snapshot the tapped image, animate arc to cart pill, bounce pill on arrival
- Sheet: drag-to-close, snap points, top corners 24px, background scrim
- Sticky category nav: highlights active section on scroll, smooth-scrolls on tap
- Promo carousel: auto-advance with pause-on-interaction, dot indicator
- Reduced motion: swap arcs/confetti for fades, disable parallax
- Toasts for add-to-cart, favorite, promo, errors
- Skeletons on initial home, menu, orders loads (simulated with short delays for realism)
- Empty states for cart, favorites, orders, search-no-results — each with illustration glyph + helpful CTA
- Disabled states: closed restaurants, sold-out items, unmet required modifiers, sub-minimum cart, in-flight checkout
- Min 44px tap targets, visible focus rings, semantic headings per route, route-specific `head()` metadata

## Mock data shape

- 8 restaurants across cuisines (Momo, Pizza, Burger, Coffee, Sushi, Biryani, Bakery, Drinks) with cover, logo, rating, prep time, open hours, pickup/dine-in flags, min order, cuisine tags
- Each restaurant: 4–6 categories, 12–20 items with description, price (Rs.), dietary, variants, modifier groups (some required), popularity flag
- 3 promo codes (percent, flat, free-item) with validation messages
- Seed orders: 1 active (Preparing) + 2 past

## Out of scope (frontend-only build)

- No backend, auth, or Lovable Cloud
- No real payment SDK — mock gateway only
- No service worker / offline (manifest-only PWA per skill)
- No push notifications

## Build order

1. Tokens, fonts, AppShell, BottomTabBar, CartPill, manifest
2. Mock data + Zustand stores (cart, favorites, orders, user)
3. Home screen end-to-end
4. Restaurant menu + item customizer sheet + cart conflict
5. Cart / checkout
6. Mock payment + verify + success
7. Orders list + tracking detail + ActiveOrderBar
8. Favorites + Profile
9. Generate hero/category/dish images, swap placeholders
10. Polish pass: empty/error/loading states, reduced-motion, a11y, micro-interactions, senior-designer review sweep

