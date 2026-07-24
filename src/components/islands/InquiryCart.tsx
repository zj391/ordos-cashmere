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
  /** Locale for the toast text + cart labels */
  locale?: string;
  /** 'toast' = global mount (toast notifications only). 'full' = /cart page (editable list). */
  mode?: 'toast' | 'full';
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

export default function InquiryCart({ locale = 'en', mode = 'toast' }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [items, setItems] = useState<CartItem[]>([]);

  // Subscribe to cart changes when in full mode (cart page)
  useEffect(() => {
    if (mode !== 'full') return;
    setItems(loadCart().items);
    const handler = (e: Event) => setItems(((e as CustomEvent<CartState>).detail || loadCart()).items);
    window.addEventListener('dx-cart-change', handler);
    // Also pull once more in case items were loaded before listener attached
    setItems(loadCart().items);
    return () => window.removeEventListener('dx-cart-change', handler);
  }, [mode]);

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

  // Avoid SSR mismatch: don't render anything until hydrated
  if (!hydrated) return null;

  return (
    <>
      {mode === 'full' && <CartList items={items} locale={locale} />}
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
    </>
  );
}

const CART_LABELS: Record<string, Record<string, string>> = {
  en: { emptyTitle: 'Your inquiry list is empty', emptyBody: 'Browse our products and click "Add to Inquiry" to start building a quote request.', emptyCta: 'Browse Products', color: 'Color', qty: 'Qty', note: 'Note', notePh: 'e.g. custom label, deliver by Nov', remove: 'Remove', itemsCount: 'items', totalQty: 'pcs total', clearAll: 'Clear all', clearConfirm: 'Clear all items from your inquiry list?', sendInquiry: 'Send Inquiry' },
  cn: { emptyTitle: '询价清单为空', emptyBody: '浏览产品并点击"加入询价单"开始组装询价请求。', emptyCta: '浏览产品', color: '颜色', qty: '数量', note: '备注', notePh: '如：定制标签，11月前交货', remove: '移除', itemsCount: '件产品', totalQty: '件总数', clearAll: '清空', clearConfirm: '确定清空询价清单？', sendInquiry: '发送询价' },
  de: { emptyTitle: 'Ihre Anfrageliste ist leer', emptyBody: 'Produkte ansehen und auf "Zur Anfrage hinzufügen" klicken.', emptyCta: 'Produkte ansehen', color: 'Farbe', qty: 'Menge', note: 'Notiz', notePh: 'z.B. eigenes Label, Lieferung bis Nov', remove: 'Entfernen', itemsCount: 'Artikel', totalQty: 'Stk. gesamt', clearAll: 'Alle entfernen', clearConfirm: 'Alle Artikel entfernen?', sendInquiry: 'Anfrage senden' },
  fr: { emptyTitle: 'Votre liste est vide', emptyBody: 'Parcourez les produits et cliquez sur "Ajouter à la demande".', emptyCta: 'Voir les produits', color: 'Couleur', qty: 'Qté', note: 'Note', notePh: 'ex: étiquette personnalisée, livraison nov.', remove: 'Retirer', itemsCount: 'articles', totalQty: 'pcs total', clearAll: 'Tout vider', clearConfirm: 'Vider toute la liste ?', sendInquiry: 'Envoyer la demande' },
  ja: { emptyTitle: 'リストは空です', emptyBody: '製品を閲覧し「問い合わせに追加」をクリックしてください。', emptyCta: '製品を見る', color: '色', qty: '数量', note: '備考', notePh: '例: カスタムラベル、11月納期', remove: '削除', itemsCount: 'アイテム', totalQty: '枚 合計', clearAll: 'すべて削除', clearConfirm: 'すべて削除しますか？', sendInquiry: '問い合わせ送信' },
  kr: { emptyTitle: '목록이 비어 있습니다', emptyBody: '제품을 찾아 "문의에 추가"를 클릭하세요.', emptyCta: '제품 보기', color: '색상', qty: '수량', note: '메모', notePh: '예: 맞춤 라벨, 11월 납기', remove: '삭제', itemsCount: '품목', totalQty: '개 합계', clearAll: '전체 삭제', clearConfirm: '전체 삭제하시겠습니까?', sendInquiry: '문의 보내기' },
};

function CartList({ items, locale }: { items: CartItem[]; locale: string }) {
  const L = (k: string) => CART_LABELS[locale]?.[k] || CART_LABELS.en[k] || k;
  if (items.length === 0) {
    const href = `/${locale}/products`;
    return (
      <div className="text-center py-16 border border-dashed border-border rounded-lg bg-secondary/10">
        <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        <h2 className="font-display text-2xl mb-2">{L('emptyTitle')}</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">{L('emptyBody')}</p>
        <a href={href} className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90">{L('emptyCta')}</a>
      </div>
    );
  }

  function buildSummary() {
    return items.map((it) => `${it.name}${it.color ? ' [' + it.color + ']' : ''} (${it.qty} pcs)`).join(' | ');
  }
  function sendInquiry() {
    const summary = buildSummary();
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(items))));
    const url = `/${locale}/contact?from=cart&items=${encodeURIComponent(payload)}&summary=${encodeURIComponent(summary)}`;
    window.location.href = url;
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={`${it.id}-${it.color || ''}`} className="grid grid-cols-[80px_1fr_auto] gap-4 items-start bg-card border border-border rounded-lg p-4">
            <img src={it.image} alt={it.name} className="w-20 h-20 object-cover rounded" loading="lazy" />
            <div className="min-w-0 space-y-2">
              <a href={it.href} className="font-medium hover:text-primary line-clamp-2 block">{it.name}</a>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>SKU: {it.id}</span>
                {it.color && <span className="px-2 py-0.5 bg-secondary rounded">{L('color')}: {it.color}</span>}
                <span>MOQ: {it.moq}</span>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <label className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{L('qty')}</span>
                  <input
                    type="number"
                    min="1"
                    value={it.qty}
                    onChange={(e) => window.dxCart?.update(it.id, { qty: Math.max(1, parseInt(e.target.value, 10) || 1) }, it.color)}
                    className="w-20 px-2 py-1 border border-border rounded text-sm bg-background"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs flex-1 min-w-[200px]">
                  <span className="text-muted-foreground">{L('note')}</span>
                  <input
                    type="text"
                    defaultValue={it.note || ''}
                    placeholder={L('notePh')}
                    onBlur={(e) => window.dxCart?.update(it.id, { note: e.target.value }, it.color)}
                    className="flex-1 px-2 py-1 border border-border rounded text-sm bg-background"
                  />
                </label>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.dxCart?.remove(it.id, it.color)}
              aria-label={L('remove')}
              className="text-muted-foreground hover:text-red-600 transition-colors p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">{items.length} {L('itemsCount')} · {items.reduce((n, it) => n + it.qty, 0)} {L('totalQty')}</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => { if (confirm(L('clearConfirm'))) window.dxCart?.clear(); }} className="px-4 py-2 text-sm text-muted-foreground hover:text-red-600">{L('clearAll')}</button>
          <button type="button" onClick={sendInquiry} className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90">{L('sendInquiry')} →</button>
        </div>
      </div>
    </div>
  );
}