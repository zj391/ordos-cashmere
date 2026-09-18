/**
 * Category catalog client-side filtering + pagination.
 *
 * Reused by CategoryPage.astro and (optionally) future list views.
 * Keeps the inline JS in CategoryPage.astro under ~30 lines so the
 * component file stays readable.
 *
 * Behaviour:
 * - text search across product.name + product.id + product.material
 * - category filter (hats / sweaters / scarves / accessories / yarn / all)
 * - PAGE_SIZE = 24 products per page
 * - page-jump input + Go button
 * - "Showing X–Y of Z products" status line
 *
 * The page renders the full SSR list initially, then this module
 * replaces the visible portion with the filtered/paginated slice.
 */

export interface CategoryCatalogItem {
  id: string;
  name: string;
  material?: string;
  categoryId?: string;
}

export interface CategoryCatalogOptions {
  /** Selector for the grid container that wraps the product cards */
  gridSelector: string;
  /** Selector for the search input */
  searchSelector: string;
  /** Selector for the category filter buttons (data-cat attribute) */
  filterSelector: string;
  /** Selector for the "Showing X–Y of Z" text */
  infoSelector: string;
  /** Selector for the pagination nav container */
  paginationSelector: string;
  /** Selector for the page-jump input */
  jumpInputSelector: string;
  /** Selector for the page-jump Go button */
  jumpButtonSelector: string;
  /** Number of cards per page */
  pageSize?: number;
  /** When true, filters are applied immediately; otherwise on input change */
  liveFilter?: boolean;
  /** Locale for the page (used for "Showing X of Y" formatting) */
  locale?: string;
}

const I18N: Record<string, Record<string, string>> = {
  en: {
    showing: 'Showing {start}–{end} of {total} products',
    noMatch: 'No products match your filters',
    goToPage: 'Go to page:',
    go: 'Go',
  },
  cn: {
    showing: '显示第 {start}-{end} 条 / 共 {total} 条',
    noMatch: '没有符合筛选条件的产品',
    goToPage: '跳转到第',
    go: '页',
  },
  de: {
    showing: '{start}–{end} von {total} Produkten',
    noMatch: 'Keine passenden Produkte',
    goToPage: 'Gehe zu Seite:',
    go: 'Los',
  },
  fr: {
    showing: 'Affichage {start}–{end} sur {total} produits',
    noMatch: 'Aucun produit correspondant',
    goToPage: 'Aller à la page :',
    go: 'OK',
  },
  ja: {
    showing: '{start}–{end} 件 / 全 {total} 件',
    noMatch: '一致する商品はありません',
    goToPage: 'ページ移動：',
    go: '移動',
  },
  kr: {
    showing: '{start}–{end} / 전체 {total}개',
    noMatch: '일치하는 제품 없음',
    goToPage: '페이지 이동:',
    go: '이동',
  },
};

function t(locale: string, key: string, vars?: Record<string, string | number>): string {
  const dict = I18N[locale] || I18N.en;
  let s = dict[key] || I18N.en[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace('{' + k + '}', String(v));
    }
  }
  return s;
}

export function initCategoryCatalog(opts: CategoryCatalogOptions): void {
  const PAGE_SIZE = opts.pageSize ?? 24;
  const grid = document.querySelector(opts.gridSelector);
  const searchInput = document.querySelector<HTMLInputElement>(opts.searchSelector);
  const filterButtons = document.querySelectorAll<HTMLButtonElement>(opts.filterSelector);
  const info = document.querySelector(opts.infoSelector);
  const pagination = document.querySelector(opts.paginationSelector);
  const jumpInput = document.querySelector<HTMLInputElement>(opts.jumpInputSelector);
  const jumpBtn = document.querySelector<HTMLButtonElement>(opts.jumpButtonSelector);

  if (!grid) return;

  // Cache the original SSR list of product cards (as DOM nodes).
  const originalCards = Array.from(grid.children) as HTMLElement[];
  // Pull structured data from each card's dataset. The CategoryPage
  // already encodes searchable text via data-search or class hooks, but to
  // keep the integration minimal we use the cards' inner text + id from the
  // anchor href.
  const items: CategoryCatalogItem[] = originalCards.map((card) => {
    const anchor = card.querySelector('a');
    const href = anchor?.getAttribute('href') || '';
    const id = (href.split('/').pop() || '').trim();
    // 2nd <span> inside category-record-card-index is the product id; 3rd block
    // is the name (h3). The material text is in a small block; we read the
    // entire visible card text so search is forgiving.
    const name = card.querySelector('h3')?.textContent?.trim() || '';
    const text = card.textContent || '';
    return { id, name, material: text };
  });

  let searchQ = '';
  let activeCat = 'all';
  let currentPage = 1;

  function matches(item: CategoryCatalogItem): boolean {
    if (activeCat !== 'all' && item.categoryId && item.categoryId !== activeCat) {
      return false;
    }
    if (searchQ) {
      const q = searchQ.toLowerCase();
      if (!((item.name || '').toLowerCase().includes(q))) {
        return false;
      }
    }
    return true;
  }

  function render() {
    const filtered = items.filter(matches);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const slice = filtered.slice(start, end);

    // Re-order DOM: place slice in order, hide the rest
    originalCards.forEach((card) => {
      card.style.display = 'none';
    });
    slice.forEach((item) => {
      const idx = items.indexOf(item);
      const card = originalCards[idx];
      if (card) {
        card.style.display = '';
        grid.appendChild(card); // re-append to enforce order
      }
    });

    // Update info text
    if (info) {
      const locale = opts.locale || document.documentElement.lang || 'en';
      info.textContent =
        total === 0
          ? t(locale, 'noMatch')
          : t(locale, 'showing', { start: String(start + 1), end: String(Math.min(end, total)), total: String(total) });
    }

    // Update pagination
    renderPagination(total, totalPages, opts.locale);
  }

  function renderPagination(total: number, totalPages: number, locale?: string) {
    if (!pagination) return;
    const lang = locale || document.documentElement.lang || 'en';
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      if (jumpInput) {
        jumpInput.max = totalPages;
        jumpInput.placeholder = totalPages > 0 ? '1–' + totalPages : '—';
        jumpInput.value = '';
        jumpInput.disabled = totalPages <= 1;
      }
      if (jumpBtn) jumpBtn.disabled = totalPages <= 1;
      return;
    }

    const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage - 2, currentPage + 1, currentPage + 2]);
    const visible = Array.from(pages).filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    let html = '';
    html += pageBtnHtml('‹', currentPage > 1 ? currentPage - 1 : null, currentPage === 1);
    let last = 0;
    for (const p of visible) {
      if (p - last > 1) html += '<span class="px-2 text-muted-foreground/70">…</span>';
      html += pageBtnHtml(String(p), p, false, p === currentPage);
      last = p;
    }
    html += pageBtnHtml('›', currentPage < totalPages ? currentPage + 1 : null, currentPage === totalPages);
    pagination.innerHTML = html;
    pagination.querySelectorAll('button[data-page]').forEach((b) => {
      b.addEventListener('click', () => {
        const p = parseInt(b.getAttribute('data-page') || '0');
        if (!isNaN(p) && p !== currentPage) {
          currentPage = p;
          render();
        }
      });
    });

    if (jumpInput) {
      jumpInput.max = totalPages;
      jumpInput.placeholder = '1–' + totalPages;
      jumpInput.value = '';
      jumpInput.disabled = totalPages <= 1;
    }
    if (jumpBtn) jumpBtn.disabled = totalPages <= 1;
  }

  function pageBtnHtml(label: string, page: number | null, disabled: boolean, active = false): string {
    const baseCls = 'min-w-[40px] h-10 px-3 inline-flex items-center justify-center text-sm border transition-colors';
    if (disabled) {
      return `<button disabled class="${baseCls} bg-brand-cream text-muted-foreground/50 border-border cursor-not-allowed">${label}</button>`;
    }
    if (active) {
      return `<button data-page="${page}" class="${baseCls} bg-brand-ink text-brand-cream border-brand-ink hover:bg-brand-ink/90">${label}</button>`;
    }
    return `<button data-page="${page}" class="${baseCls} bg-white text-muted-foreground border-border hover:border-brand-ink hover:text-brand-ink">${label}</button>`;
  }

  function jumpToPage(p: number, totalPages: number): boolean {
    if (isNaN(p) || p < 1 || p > totalPages) return false;
    if (p === currentPage) return true;
    currentPage = p;
    render();
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  // Wire up controls
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQ = searchInput.value.trim();
      currentPage = 1;
      render();
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      if (cat) {
        activeCat = cat;
        currentPage = 1;
        // Update button UI
        filterButtons.forEach((b) => {
          if (b.getAttribute('data-cat') === activeCat) {
            b.classList.add('bg-brand-ink', 'text-brand-cream', 'border-brand-ink');
            b.classList.remove('bg-white', 'text-muted-foreground', 'border-border');
          } else {
            b.classList.remove('bg-brand-ink', 'text-brand-cream', 'border-brand-ink');
            b.classList.add('bg-white', 'text-muted-foreground', 'border-border');
          }
        });
        render();
      }
    });
  });

  // Jump-to-page input + Go button
  function setupJump() {
    if (!jumpInput || !jumpBtn) return;
    const tryGo = () => {
      const max = parseInt(jumpInput.max || '1');
      const target = parseInt(jumpInput.value);
      if (!jumpToPage(target, max)) {
        jumpInput.classList.add('border-red-500');
        setTimeout(() => jumpInput.classList.remove('border-red-500'), 1200);
      } else {
        jumpInput.value = '';
      }
    };
    jumpBtn.addEventListener('click', tryGo);
    jumpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); tryGo(); }
    });
  }

  // Read URL ?cat= on load (for breadcrumb clicks from product detail pages)
  try {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat');
    if (catParam) {
      const catSlugToId: Record<string, string> = {
        'hats': 'hats',
        'sweaters': 'sweaters',
        'scarves': 'scarves',
        'accessories': 'accessories',
        'yarn': 'yarn',
        'hats-accessories': 'hats',
        'garment-oem': 'sweaters',
        'accessories-cat': 'accessories',
      };
      if (catSlugToId[catParam]) {
        activeCat = catSlugToId[catParam];
        filterButtons.forEach((b) => {
          if (b.getAttribute('data-cat') === activeCat) {
            b.classList.add('bg-brand-ink', 'text-brand-cream', 'border-brand-ink');
            b.classList.remove('bg-white', 'text-muted-foreground', 'border-border');
          } else {
            b.classList.remove('bg-brand-ink', 'text-brand-cream', 'border-brand-ink');
            b.classList.add('bg-white', 'text-muted-foreground', 'border-border');
          }
        });
      }
    }
  } catch (e) { /* ignore */ }

  setupJump();
  // Set initial info + pagination labels based on full list (no filter yet)
  render();
}
