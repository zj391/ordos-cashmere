/**
 * Inquiry cart island — mounted once globally in BaseLayout.
 *
 * Responsibilities:
 *   1. Hydrate from localStorage on mount and expose window.dxCart API.
 *   2. Listen to dx-cart-change events and re-emit (single source of truth).
 *   3. Render a small toast notification when items are added.
 *
 * The cart page (src/pages/[locale]/cart.astro) hydrates this same island
 * in "full" mode (Task 6) to render the editable list; the global mount
 * here is just a no-op API provider + toast host.
 */
import { useEffect, useState } from 'react';
import {
  loadCart, saveCart, addItem as libAddItem, removeItem as libRemoveItem,
  updateItem as libUpdateItem, clearCart as libClearCart, cartCount,
  type CartItem, type CartState,
} from '@/lib/inquiry-cart';

declare global {
  interface Window {
    dxCart?: {
      add: (item: CartItem) => CartState;
      remove: (id: string, color?: string) => CartState;
      update: (id: string, patch: Partial<CartItem>, color?: string) => CartState;
      clear: () => CartState;
      get: () => CartState;
      count: () => number;
      subscribe: (fn: (s: CartState) => void) => () => void;
    };
  }
}

interface Props {
  /** Locale for the toast text */
  locale?: string;
}

const TOAST_LABELS: Record<string, { added: string; viewCart: string }> = {
  en: { added: 'Added to inquiry list', viewCart: 'View List →' },
  cn: { added: '已加入询价清单', viewCart: '查看清单 →' },
  de: { added: 'Zur Anfrage hinzugefügt', viewCart: 'Liste ansehen →' },
  fr: { added: 'Ajouté à la demande', viewCart: 'Voir la liste →' },
  ja: { added: '問い合わせに追加しました', viewCart: 'リストを見る →' },
  kr: { added: '문의에 추가됨', viewCart: '목록 보기 →' },
};

interface Toast { id: number; msg: string; action?: { label: string; href: string } }

export default function InquiryCart({ locale = 'en' }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Expose global API. Single source of truth = localStorage.
    window.dxCart = {
      add: (item) => {
        const next = libAddItem(item);
        pushToast(item);
        return next;
      },
      remove: libRemoveItem,
      update: libUpdateItem,
      clear: libClearCart,
      get: loadCart,
      count: () => cartCount(loadCart()),
      subscribe: (fn) => {
        const handler = (e: Event) => fn((e as CustomEvent<CartState>).detail);
        window.addEventListener('dx-cart-change', handler);
        return () => window.removeEventListener('dx-cart-change', handler);
      },
    };
    // Re-broadcast storage changes from other tabs as dx-cart-change so badges update.
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'dx-inquiry-cart-v1') {
        try {
          const detail = e.newValue ? JSON.parse(e.newValue) as CartState : { items: [], updatedAt: 0 };
          window.dispatchEvent(new CustomEvent('dx-cart-change', { detail }));
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    setHydrated(true);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  function pushToast(item: CartItem) {
    const labels = TOAST_LABELS[locale] || TOAST_LABELS.en;
    const id = Date.now() + Math.random();
    const cartHref = `/${locale}/cart`;
    const msg = labels.added;
    setToasts((cur) => [...cur, { id, msg, action: { label: labels.viewCart, href: cartHref } }]);
    setTimeout(() => {
      setToasts((cur) => cur.filter((t) => t.id !== id));
    }, 3500);
  }

  // Render a fixed-position toast stack. Only show after hydration to avoid SSR mismatch.
  if (!hydrated) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-primary text-primary-foreground text-sm rounded-md shadow-lg px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
          <span>{t.msg}</span>
          {t.action && (
            <a href={t.action.href} className="underline font-medium hover:no-underline whitespace-nowrap">
              {t.action.label}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}