/**
 * 仅将已完成独立资料核验与引用审阅的博客文章作为可索引知识内容。
 * 其他历史文章继续保留原 URL，供已有访问者和业务内部审阅使用，但不会
 * 被 sitemap、Article Schema 或博客枢纽作为搜索入口放大。
 */
export const INDEXABLE_BLOG_IDS = new Set([
  'en/cashmere-test-report-checklist-b2b-buyers',
  'en/eu-textile-dpp-registry-2026-update',
  'cn/eu-textile-dpp-registry-2026-update',
  'en/eu-unsold-apparel-rules-2026-update',
  'cn/eu-unsold-apparel-rules-2026-update',
  'en/eu-csddd-textile-supply-chain-2026',
  'en/good-cashmere-standard-2026-update',
  'en/eu-green-claims-directive-textile-2026',
  'en/japan-korea-cashmere-import-market-2026',
  'en/2026-inner-mongolia-cashmere-harvest-season-b2b-guide',
  'en/2026-inner-mongolia-cashmere-factory-lead-time-b2b-guide',
  'en/2026-cashmere-payment-terms-buyer-impact-ordos',
  // 2026-09-08 — Just Style: "Cashmere experts contest 'unsustainable' production claims"
  // B2B buyer angle: scope-specific evidence over generic ESG labels.
  'en/cashmere-unsustainable-claim-expert-rebuttal-b2b',
  'cn/cashmere-unsustainable-claim-expert-rebuttal-b2b',
  // 2026-09-16 — Autumn OEM cutoff calendar: per-SKU final order dates for Q4/holiday 2026 delivery
  'en/2026-autumn-cashmere-sweater-oem-order-cutoff',
  'cn/2026-autumn-cashmere-sweater-oem-order-cutoff',
  // 2026-09-16 — hznzcn batch #1: 6 B2B long-tail buying guides (V-Neck batwing / hoodie / wide-leg pants / polo / V-neck cardigan / mock neck specs)
  'en/cashmere-knit-beanie-wholesale-b2b-buying-guide',
  'cn/cashmere-knit-beanie-wholesale-b2b-buying-guide',
  'en/cashmere-hoodie-wholesale-knit-gauge-guide',
  'cn/cashmere-hoodie-wholesale-knit-gauge-guide',
  'en/cashmere-wide-leg-knit-pants-wholesale-guide',
  'cn/cashmere-wide-leg-knit-pants-wholesale-guide',
  'en/cashmere-polo-sweater-wholesale-style-guide',
  'cn/cashmere-polo-sweater-wholesale-style-guide',
  'en/cashmere-v-neck-cardigan-wholesale-b2b-guide',
  'cn/cashmere-v-neck-cardigan-wholesale-b2b-guide',
  'en/cashmere-mock-neck-wholesale-b2b-sizing-guide',
  'cn/cashmere-mock-neck-wholesale-b2b-sizing-guide',
  // 2026-09-16 — hznzcn batch #2: cross-link showcase + sourcing guide for new sweaters-281..300
  'en/fw2025-cashmere-sweater-wholesale-showcase',
  'cn/fw2025-cashmere-sweater-wholesale-showcase',
  'en/sourcing-cashmere-from-china-b2b-fw2025-guide',
  'cn/sourcing-cashmere-from-china-b2b-fw2025-guide',
  // 2026-09-17 — yarn formulations guide: cross-link to /products/yarn/ category page
  // (yarn-formulas.ts + CategoryPage.astro yarn section are the inbound targets)
  'en/cashmere-yarn-formulations-ordos-facility-2026',
  'cn/cashmere-yarn-formulations-ordos-facility-2026',
  // 2026-09-17 — CN translations for the 8 priority EN-only blog posts (B2B
  // manufacturing guides + EU policy compliance + Asia sourcing). All 8 are
  // quality-graded (>=1400 EN words, full frontmatter + structured body)
  // and were previously used as EN-only; adding CN versions brings CN sitemap
  // from 12 to 20 indexable entries.
  'cn/2026-inner-mongolia-cashmere-factory-lead-time-b2b-guide',
  'cn/2026-inner-mongolia-cashmere-harvest-season-b2b-guide',
  'cn/cashmere-test-report-checklist-b2b-buyers',
  'cn/eu-csddd-textile-supply-chain-2026',
  'cn/eu-green-claims-directive-textile-2026',
  'cn/good-cashmere-standard-2026-update',
  'cn/japan-korea-cashmere-import-market-2026',
  // 2026-09-17 — Promote 9 EN blog posts that were previously not in
  // INDEXABLE_BLOG_IDS (they had full frontmatter + 1000-2600 words + aiGen=false
  // but were missed from the whitelist when first written). All 9 are
  // B2B product comparison / manufacturing guides that match the
  // existing indexable blog pattern.
  'en/cashmere-baby-blanket-vs-set',
  'en/cashmere-gloves-private-label',
  'en/cashmere-hijab-manufacturing',
  'en/cashmere-leggings-manufacturing',
  'en/cashmere-scarf-vs-pashmina-shawl',
  'en/cashmere-scarf-weight-by-climate',
  'en/cashmere-socks-vs-wool-socks',
  'en/cashmere-travel-wrap-set',
  'en/cashmere-eu-dpp-compliance',
]);

export function getBlogSlugFromId(id: string) {
  const [, ...segments] = id.replace(/\.md$/, '').split('/');
  return segments.join('/');
}

export function isIndexableBlogPost(locale: string, slug: string) {
  return INDEXABLE_BLOG_IDS.has(`${locale}/${slug}`);
}
