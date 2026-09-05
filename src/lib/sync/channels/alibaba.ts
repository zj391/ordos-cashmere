/**
 * 1688 (alibaba) channel (mock implementation).
 *
 * 2026-09-04 zj ask: 同步 ordos-cashmere products to 1688 seller
 * storefront for Chinese domestic B2B sourcing.
 *
 * 真实 API (商家开放平台):
 *   https://open.1688.com/doc/api/cn/1688api.htm
 *   alibaba.product.add (商品发布) — POST /param2/1/cn.alibaba.open/
 *   alibaba.product.update — for updates
 *   alibaba.product.pic.upload — 图片上传
 *
 * Required env: ALIBABA_APP_KEY, ALIBABA_APP_SECRET, ALIBABA_ACCESS_TOKEN
 *
 * ordos-cashmere 产品记录没有 'price' 字段 (memory 8-20 strict
 * facts-only). 1688 要求 price. 这里用 'INQUIRY' 占位 (1688 支持
 * 议价商品), 不编造具体数字. 实际 1688 listing 启用后由 sales 团队
 * 在 1688 后台手工填价.
 */

import type { SyncChannel } from '../channel-base';
import type { ChannelContent, ChannelResult, ProductPayload } from '../types';

export class AlibabaChannel implements SyncChannel {
  readonly id = 'alibaba' as const;
  readonly label = '1688';
  readonly isAutomated = true;

  format(product: ProductPayload): ChannelContent {
    // 1688 product title: concise, factual, no marketing fluff.
    // 1688's recommendation is title <= 30 chars but we keep
    // brand + product identity for traceability.
    const titleCore = product.name.length > 60 ? product.name.slice(0, 57) + '...' : product.name;
    const title = `DONGXIAO ${titleCore}`;

    // 1688 description: plain text with field markers (1688 parses
    // these for the front-end rendering). Price is set to INQUIRY
    // (议价) — 1688 supports this for non-fixed-price listings.
    const descriptionLines = [
      `Brand: DONGXIAO® (Ordos Dongxiao Cashmere Products Factory)`,
      `Origin: Ordos, Inner Mongolia, China`,
      `Category: ${product.category}`,
    ];
    if (product.material) descriptionLines.push(`Material: ${product.material}`);
    if (product.micron) descriptionLines.push(`Fiber fineness: ${product.micron}`);
    descriptionLines.push('');
    descriptionLines.push(product.intro);
    descriptionLines.push('');
    descriptionLines.push('Source URL: ' + product.sourceUrl);
    descriptionLines.push('Listing type: INQUIRY (price on request)');
    descriptionLines.push('MOQ: see source page or contact via inquiry');
    descriptionLines.push('Trade terms: see source page');

    return {
      title,
      body: descriptionLines.join('\n'),
      description: descriptionLines.join('\n'),
      images: product.images.slice(0, 5), // 1688 max 5 main images
      tags: [
        'cashmere',
        'wholesale',
        product.category.split(' ')[0]?.toLowerCase() || 'cashmere',
        'B2B',
        'Ordos',
        'Inner Mongolia',
      ],
      // 1688-specific: 议价 (negotiable) product
      price: 'INQUIRY',
      ctaUrl: product.sourceUrl,
    };
  }

  async push(_content: ChannelContent, product: ProductPayload): Promise<ChannelResult> {
    const env = (typeof process !== 'undefined' ? process.env : null) as NodeJS.ProcessEnv | null;
    const appKey = env?.ALIBABA_APP_KEY;
    const accessToken = env?.ALIBABA_ACCESS_TOKEN;

    if (!appKey || !accessToken) {
      return {
        channel: 'alibaba',
        status: 'skipped',
        errorMessage:
          '1688 not configured. Set ALIBABA_APP_KEY, ALIBABA_APP_SECRET, ALIBABA_ACCESS_TOKEN in Vercel env to enable automated posting.',
        pushedAt: Date.now(),
      };
    }

    // TODO(phase-2): real flow —
    //   1) alibaba.product.pic.upload  (upload each image, get picIds)
    //   2) alibaba.product.add        (create draft, get productId)
    //   3) alibaba.product.update      (push to live)
    return {
      channel: 'alibaba',
      status: 'skipped',
      errorMessage: `1688 API client not yet implemented. Configured appKey=${appKey.slice(0, 6)}…, product=${product.id}.`,
      pushedAt: Date.now(),
    };
  }
}
