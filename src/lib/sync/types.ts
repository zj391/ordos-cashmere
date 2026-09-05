/**
 * Multi-channel sync types.
 *
 * 2026-09-04 zj ask: 同步 ordos-cashmere 产品到 LinkedIn (公司页),
 * 小红书 (笔记), 1688 (商家商品). 每个 channel 有自己的 content
 * shape, format, API; 通过 SyncChannel interface 统一调用.
 *
 * 内存中的 sync log (后续 DB). 严格 facts-only: 不编造 brand 词
 * / 价格 / MOQ / 库存 / 性能承诺 (memory 8-20).
 */

export type ChannelId = 'linkedin' | 'alibaba' | 'xiaohongshu';

export type ChannelStatus =
  | 'pending'      // queued, not started
  | 'pushed'       // successfully posted to platform
  | 'manual_ready' // (xiaohongshu) template generated, awaiting human post
  | 'skipped'      // no API creds, not pushed this run
  | 'error';       // push failed; see errorMessage

export interface ProductPayload {
  id: string;          // 'hats-100'
  name: string;        // 'Fold up Pure Cashmere Hat...'
  category: string;    // 'Cashmere Hats & Beanies'
  intro: string;       // product short blurb (multi-locale aware)
  material?: string;   // '100% Cashmere'
  micron?: string;     // '14-15.5µm'
  images: string[];   // absolute URLs (e.g. https://www.erdosdx.com/products/mic/prod_000_00.webp)
  sourceUrl: string;   // canonical product page URL
  locale: string;      // 'en' | 'cn' | 'de' | ...
}

export interface ChannelContent {
  // Channel-specific rendered payload. Each channel
  // adapter decides what fields it actually consumes.
  title: string;
  body: string;        // LinkedIn / xiaohongshu body
  description?: string; // 1688 商品 description
  images: string[];
  tags?: string[];      // 小红书 hashtag / 1688 keyword
  price?: string;       // 1688 only — placeholder for now
  ctaUrl?: string;      // LinkedIn / xiaohongshu link back to source
  /** raw blob for channels that need extra fields (e.g. 1688 sku props) */
  extra?: Record<string, unknown>;
}

export interface ChannelResult {
  channel: ChannelId;
  status: ChannelStatus;
  /** External post id, when platform returned one. */
  externalId?: string;
  /** Permanent URL to the published post / product. */
  externalUrl?: string;
  /** For manual channels: a deep link to the generated template (e.g. /admin/sync?preview=…). */
  previewUrl?: string;
  errorMessage?: string;
  pushedAt: number; // epoch ms
}

export interface SyncLogEntry {
  id: string;                       // uuid-ish
  productId: string;
  productName: string;
  channels: ChannelResult[];
  startedAt: number;
  finishedAt?: number;
  triggeredBy: string;              // 'admin:zj' or 'cron:nightly'
}
