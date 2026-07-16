/**
 * Admin sidebar nav configuration. Single source of truth for the dashboard nav.
 * The 9 modules mirror the reference screenshot: dashboard, products, news, pages,
 * images, inquiries, SEO, contact info. Plus 2 added tabs: banner + system info.
 *
 * Icon strings are inline SVG paths (24x24, stroke=currentColor) for zero-external-dep
 * rendering. Each item maps to /[locale]/admin/<path>.
 */

export interface AdminNavItem {
  key: string;
  path: string;            // path segment after /admin/
  icon: string;            // inline SVG (already wrapped in <svg>)
  label: Record<string, string>;
  badge?: string;          // optional badge text (e.g. unread count)
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    key: 'dashboard',
    path: '',
    icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
    label: {
      en: 'Dashboard', cn: '仪表盘', de: 'Übersicht', fr: 'Tableau de bord',
      ja: 'ダッシュボード', kr: '대시보드',
    },
  },
  {
    key: 'products',
    path: 'products',
    icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 11m16 0l-8 4m0 0L4 21m8-4v10"/></svg>',
    label: {
      en: 'Products', cn: '产品管理', de: 'Produkte', fr: 'Produits',
      ja: '製品管理', kr: '제품 관리',
    },
  },
  {
    key: 'news',
    path: 'news',
    icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V9m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-2 4h2m-2 4h2m-6-4h.01M9 16h.01"/></svg>',
    label: {
      en: 'News', cn: '新闻管理', de: 'Nachrichten', fr: 'Actualités',
      ja: 'ニュース管理', kr: '뉴스 관리',
    },
  },
  {
    key: 'pages',
    path: 'pages',
    icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
    label: {
      en: 'Pages', cn: '页面管理', de: 'Seiten', fr: 'Pages',
      ja: 'ページ管理', kr: '페이지 관리',
    },
  },
  {
    key: 'images',
    path: 'images',
    icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m0-6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>',
    label: {
      en: 'Images', cn: '图片管理', de: 'Bilder', fr: 'Images',
      ja: '画像管理', kr: '이미지 관리',
    },
  },
  {
    key: 'inquiries',
    path: 'inquiries',
    icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>',
    label: {
      en: 'Inquiries', cn: '询盘管理', de: 'Anfragen', fr: 'Demandes',
      ja: '問い合わせ管理', kr: '문의 관리',
    },
    badge: '12', // TODO: replace with real unread count (already wired in dashboard)
  },
  {
    key: 'seo',
    path: 'seo',
    icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>',
    label: {
      en: 'SEO', cn: 'SEO 设置', de: 'SEO', fr: 'SEO',
      ja: 'SEO設定', kr: 'SEO 설정',
    },
  },
  {
    key: 'contact',
    path: 'contact',
    icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>',
    label: {
      en: 'Contact Info', cn: '联系方式', de: 'Kontakt', fr: 'Contact',
      ja: '連絡先', kr: '연락처',
    },
  },
  {
    key: 'banner',
    path: 'banner',
    icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16M4 6l4 4m12-4l-4 4"/></svg>',
    label: {
      en: 'Banners', cn: 'Banner 管理', de: 'Banner', fr: ' Bannières',
      ja: 'バナー管理', kr: '배너 관리',
    },
  },
  {
    key: 'cases',
    path: 'cases',
    icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
    label: {
      en: 'Case Studies', cn: '案例管理', de: 'Fallstudien', fr: 'Études de cas',
      ja: '事例管理', kr: '사례 관리',
    },
  },
  {
    key: 'downloads',
    path: 'downloads',
    icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>',
    label: {
      en: 'Downloads', cn: '下载资料', de: 'Downloads', fr: 'Téléchargements',
      ja: 'ダウンロード資料', kr: '다운로드 자료',
    },
  },
  {
    key: 'system',
    path: 'system',
    icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    label: {
      en: 'System Info', cn: '系统设置', de: 'System', fr: 'Système',
      ja: 'システム設定', kr: '시스템 설정',
    },
  },
];
