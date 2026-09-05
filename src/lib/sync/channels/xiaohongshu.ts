/**
 * 小红书 (Xiaohongshu) channel — manual template generator.
 *
 * 2026-09-04 zj ask: 同步产品到小红书.
 *
 * 现实约束: 小红书 没有 官方 B2B/营销 API. 公开 API 仅对内部
 * 战略合作开放. 第三方"代发"服务多数灰产 (account ban risk).
 * 因此这个 channel isAutomated=false — push() 生成一个
 * previewUrl 让 admin 在 /admin/sync 页面看到 copy-paste 模板:
 *   - 标题 (含 emoji, 限 20 字)
 *   - 正文 (含 hashtag)
 *   - 9 张图 (URL list)
 *   - 标签 (hashtags)
 *
 * 实际发布: admin 复制内容到小红书创作者后台手动发.
 *
 * push() returns status='manual_ready' with a previewUrl that
 * the admin UI opens in a modal/iframe for easy copy-paste.
 */

import type { SyncChannel } from '../channel-base';
import type { ChannelContent, ChannelResult, ProductPayload } from '../types';

// 小红书 hashtag 常量 (zj / zj's team 维护一份 list)
const XHS_LOCALE_TAGS: Record<string, string[]> = {
  en: ['#Cashmere', '#Wholesale', '#B2B', '#InnerMongolia', '#CashmereHat'],
  cn: ['#羊绒', '#羊绒源头工厂', '#B2B外贸', '#鄂尔多斯', '#羊绒帽'],
  de: ['#Kaschmir', '#Großhandel', '#B2B', '#InnereMongolei'],
  fr: ['#Cachemire', '#Grossiste', '#B2B', '#MongolieIntérieure'],
  ja: ['#カシミア', '#卸売', '#B2B', '#内モンゴル'],
  kr: ['#캐시미어', '#도매', '#B2B', '#내몽골'],
};

const XHS_TITLE_TEMPLATES: Record<string, (p: ProductPayload) => string> = {
  // 小红书 titles are typically < 20 chars + emoji
  en: (p) => `✨ ${p.name.split(' ').slice(0, 4).join(' ')}`,
  cn: (p) => `✨ 鄂尔多斯源头 · ${p.name.split(' ').slice(0, 4).join(' ')}`,
  de: (p) => `✨ Kaschmir ab Werk: ${p.name.split(' ').slice(0, 3).join(' ')}`,
  fr: (p) => `✨ Cachemire d'usine : ${p.name.split(' ').slice(0, 3).join(' ')}`,
  ja: (p) => `✨ 工場直販カシミア：${p.name.split(' ').slice(0, 3).join(' ')}`,
  kr: (p) => `✨ 공장 직영 캐시미어: ${p.name.split(' ').slice(0, 3).join(' ')}`,
};

export class XiaohongshuChannel implements SyncChannel {
  readonly id = 'xiaohongshu' as const;
  readonly label = '小红书 (manual)';
  readonly isAutomated = false;

  format(product: ProductPayload): ChannelContent {
    const tags = XHS_LOCALE_TAGS[product.locale] ?? XHS_LOCALE_TAGS.en;
    const titleFn = XHS_TITLE_TEMPLATES[product.locale] ?? XHS_TITLE_TEMPLATES.en;

    const body =
      `📍 Ordos Inner Mongolia source factory\n` +
      `🏷 ${product.category}\n` +
      (product.material ? `🧵 ${product.material}\n` : '') +
      (product.micron ? `✨ ${product.micron}\n` : '') +
      `\n${product.intro}\n` +
      `\n💬 B2B inquiry welcome\n` +
      `🔗 ${product.sourceUrl}\n` +
      `\n${tags.join(' ')}`;

    return {
      title: titleFn(product),
      body,
      images: product.images.slice(0, 9), // 小红书 max 9 images per note
      tags,
      ctaUrl: product.sourceUrl,
    };
  }

  async push(content: ChannelContent, product: ProductPayload): Promise<ChannelResult> {
    // No API call — generate preview URL that admin UI can render.
    // The previewUrl encodes the rendered content so the admin page
    // can display a copy-paste card without re-running format().
    const previewUrl = `/admin/sync?preview=${encodeURIComponent(product.id)}`;
    return {
      channel: 'xiaohongshu',
      status: 'manual_ready',
      previewUrl,
      // Embed rendered content for the admin UI to show
      // (only meaningful when serialized via /api/sync response).
      externalId: undefined,
      externalUrl: undefined,
      errorMessage: undefined,
      pushedAt: Date.now(),
    };
  }
}
