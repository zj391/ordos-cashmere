/**
 * Inquiry cart (B2B RFQ list) — client-side storage.
 * Same shape used by InquiryCart React island + nav badge script.
 */
export interface CartItem {
  /** product SKU (e.g. "hat-fold-pure-natural") */
  id: string;
  /** product display name (locale-aware, snapshotted at add-time) */
  name: string;
  categoryId: string;
  /** primary image URL (already resolved to /products/<dir>/<img>) */
  image: string;
  /** price string as displayed (e.g. "12.5-15") */
  price: string;
  currency: string;
  /** minimum order qty from product data */
  moq: number;
  /** optional: color name from color picker */
  color?: string;
  /** quantity the buyer wants to quote for; defaults to MOQ */
  qty: number;
  /** per-item note (e.g. "need by Nov, custom label") */
  note?: string;
  /** product detail page URL (locale-prefixed) for "edit" link */
  href: string;
}

export interface CartState {
  items: CartItem[];
  updatedAt: number;
}

const STORAGE_KEY = 'dx-inquiry-cart-v1';
const MAX_ITEMS = 50;
const MAX_QTY_PER_ITEM = 100000;

export function emptyCart(): CartState {
  return { items: [], updatedAt: 0 };
}

export function loadCart(): CartState {
  if (typeof localStorage === 'undefined') return emptyCart();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCart();
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed || !Array.isArray(parsed.items)) return emptyCart();
    // prune bad entries
    parsed.items = parsed.items
      .filter((it) => it && typeof it.id === 'string' && it.id.length > 0)
      .slice(0, MAX_ITEMS);
    return parsed;
  } catch {
    return emptyCart();
  }
}

export function saveCart(state: CartState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    state.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // notify same-tab subscribers (storage event only fires for OTHER tabs)
    window.dispatchEvent(new CustomEvent('dx-cart-change', { detail: state }));
  } catch (err) {
    // quota exceeded or denied — silent fail
    console.warn('[inquiry-cart] save failed', err);
  }
}

export function addItem(item: CartItem): CartState {
  const cart = loadCart();
  // merge by id+color (same SKU + same color = bump qty)
  const idx = cart.items.findIndex((it) => it.id === item.id && (it.color || '') === (item.color || ''));
  if (idx >= 0) {
    cart.items[idx].qty = clampQty(cart.items[idx].qty + item.qty);
  } else {
    cart.items.push({ ...item, qty: clampQty(item.qty) });
  }
  if (cart.items.length > MAX_ITEMS) cart.items = cart.items.slice(-MAX_ITEMS);
  saveCart(cart);
  return cart;
}

export function removeItem(id: string, color?: string): CartState {
  const cart = loadCart();
  cart.items = cart.items.filter((it) => !(it.id === id && (it.color || '') === (color || '')));
  saveCart(cart);
  return cart;
}

export function updateItem(id: string, patch: Partial<CartItem>, color?: string): CartState {
  const cart = loadCart();
  const idx = cart.items.findIndex((it) => it.id === id && (it.color || '') === (color || ''));
  if (idx < 0) return cart;
  cart.items[idx] = { ...cart.items[idx], ...patch, qty: clampQty(patch.qty ?? cart.items[idx].qty) };
  saveCart(cart);
  return cart;
}

export function clearCart(): CartState {
  const cart = emptyCart();
  saveCart(cart);
  return cart;
}

export function cartCount(cart: CartState): number {
  return cart.items.reduce((n, it) => n + (it.qty > 0 ? 1 : 0), 0);
}

function clampQty(q: number): number {
  if (!Number.isFinite(q) || q < 1) return 1;
  return Math.min(Math.floor(q), MAX_QTY_PER_ITEM);
}
