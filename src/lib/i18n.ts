/**
 * 多语言配置中心
 * 6 国子目录：/en /de /fr /ja /kr /cn
 * Schema: ISO 639-1 (de, fr, ja, ko) + 特殊路径映射 (cn=zh, kr=ko)
 */

export const LOCALES = ['en', 'de', 'fr', 'ja', 'kr', 'cn'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

// URL 路径 -> 翻译文件命名空间（cn 用 zh.json, kr 用 ko.json）
export const LOCALE_FILE_MAP: Record<Locale, string> = {
  en: 'en',
  de: 'de',
  fr: 'fr',
  ja: 'ja',
  kr: 'ko',  // URL kr -> 文件 ko
  cn: 'zh',  // URL cn -> 文件 zh
};

// 每个语种的本地化标签（用于 hreflang）
export const LOCALE_HREFLANG: Record<Locale, string> = {
  en: 'en',
  de: 'de',
  fr: 'fr',
  ja: 'ja',
  kr: 'ko',
  cn: 'zh-CN',
};

// 各语种完整名称（用于 selector）
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  ja: '日本語',
  kr: '한국어',
  cn: '中文',
};

// 各语种 emoji 国旗
export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🌐',
  de: '🇩🇪',
  fr: '🇫🇷',
  ja: '🇯🇵',
  kr: '🇰🇷',
  cn: '🇨🇳',
};

/**
 * 加载某个语种的翻译
 * 静态导入所有 JSON（Vite/Astro 自动内联）
 */
import en from '../i18n/en/translation.json';
import de from '../i18n/de/translation.json';
import fr from '../i18n/fr/translation.json';
import ja from '../i18n/ja/translation.json';
import ko from '../i18n/kr/translation.json';
import zh from '../i18n/cn/translation.json';

export const TRANSLATIONS: Record<Locale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  de: de as Record<string, unknown>,
  fr: fr as Record<string, unknown>,
  ja: ja as Record<string, unknown>,
  kr: ko as Record<string, unknown>,
  cn: zh as Record<string, unknown>,
};

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function pickLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * 嵌套对象 key 访问：t(translation, 'nav.home')
 *
 * 三级 fallback：
 *   1. 请求的 locale 翻译（normal case）
 *   2. 英文翻译（i18n 缺失兜底，避免向用户输出 "production.steps.step8.duration"）
 *   3. 原始 key（最终兜底，开发期可见的提示信号）
 *
 * 非开发环境会吞掉 dev-only 的告警；生产环境仅做静默 fallback。
 */
const isDev = (typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production') ||
  (typeof import.meta !== 'undefined' && (import.meta as { env?: { DEV?: boolean } })?.env?.DEV === true);

export function t(translation: Record<string, unknown>, key: string): string {
  const segments = key.split('.');
  // 1. Look up in the requested locale first.
  const fromRequested = lookup(translation, segments);
  if (fromRequested != null) return fromRequested;
  // 2. Fall back to English so the UI never renders a dotted key.
  if (translation !== TRANSLATIONS.en) {
    const fromEn = lookup(TRANSLATIONS.en as Record<string, unknown>, segments);
    if (fromEn != null) return fromEn;
  }
  // 3. Final fallback: return the raw key. In dev only, surface a warning so we
  // can find and backfill missing translations.
  if (isDev && typeof console !== 'undefined') {
    console.warn(`[i18n] missing key: ${key}`);
  }
  return key;
}

function lookup(translation: Record<string, unknown>, segments: string[]): string | null {
  let cursor: unknown = translation;
  for (const seg of segments) {
    if (cursor && typeof cursor === 'object' && seg in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[seg];
    } else {
      return null;
    }
  }
  return typeof cursor === 'string' ? cursor : null;
}

/**
 * 构造完整 URL：erdosdx.com/en/products
 */
export function localePath(locale: Locale, path = ''): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const base = `/${locale}${clean}`;
  if (base.includes('?') || base.includes('#')) return base;
  return base.endsWith('/') ? base : `${base}/`;
}
