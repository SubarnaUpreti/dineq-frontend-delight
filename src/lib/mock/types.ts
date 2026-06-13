export type Diet = "veg" | "nonveg" | "egg";

export type ModifierOption = {
  id: string;
  name: string;
  price: number; // delta
};

export type ModifierGroup = {
  id: string;
  name: string;
  min: number;
  max: number;
  required?: boolean;
  options: ModifierOption[];
};

export type Variant = {
  id: string;
  name: string;
  price: number; // absolute
};

export type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number; // base price (used when no variants)
  image: string;
  diet: Diet;
  category: string;
  popular?: boolean;
  available?: boolean;
  variants?: Variant[];
  modifierGroups?: ModifierGroup[];
};

export type Restaurant = {
  id: string;
  name: string;
  tagline: string;
  cover: string;
  logo: string;
  rating: number;
  reviewCount: number;
  prepMinutes: [number, number];
  cuisines: string[];
  pickup: boolean;
  dineIn: boolean;
  open: boolean;
  hours: string;
  minOrder: number;
  serviceChargePct: number;
  taxPct: number;
  categories: string[];
  distanceKm: number;
};

export type OrderStatus = "placed" | "accepted" | "preparing" | "ready" | "completed";

export type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number; // unit price including modifiers
  variantName?: string;
  modifierNames?: string[];
  image?: string;
};

export type Order = {
  id: string;
  number: string;
  restaurantId: string;
  restaurantName: string;
  restaurantLogo: string;
  fulfillment: "pickup" | "dinein";
  status: OrderStatus;
  placedAt: string;
  readyAt?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  serviceCharge: number;
  tax: number;
  total: number;
  customerName: string;
  customerPhone: string;
  paid: boolean;
};

export type Promo = {
  code: string;
  label: string;
  kind: "percent" | "flat";
  value: number;
  minOrder?: number;
  max?: number;
};

export type Category = {
  id: string;
  label: string;
  emoji: string;
  tint: string; // bg color class fragment
};
