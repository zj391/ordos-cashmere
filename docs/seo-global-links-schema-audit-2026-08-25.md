# 全局导航、实体 Schema 与 noindex 页面信号审计

## 审计发现

工厂页已被标记为 `noindex,nofollow`，但仍通过顶级导航、页脚、站点级预取和 BaseLayout 的品牌实体逻辑获得强内部链接与 `Organization`/`LocalBusiness` Schema。全局 LocalBusiness 还输出了未经当前资料独立核验的精确工业园地址和坐标。

此外，BaseLayout 即使在 noindex 页面上也会输出空的 JSON-LD 图；工厂页的 FAQ 组件还单独输出 FAQPage JSON-LD。这会使 noindex 页面继续携带不必要的结构化数据，即使它们不再位于 sitemap。

## 实施

工厂页仍可由已有 URL 直接访问，但从顶级导航、页脚和全站预取中移除。BaseLayout 不再把 noindex 页面作为品牌实体页，也不在 noindex 页面输出 WebPage、Organization、LocalBusiness、服务、面包屑、FAQ 或调用方自定义 Schema。工厂页 FAQ 保持对访客可见，但抑制其 FAQPage JSON-LD。

全局 Organization Schema 收敛为品牌名称、站点 URL、Logo 和现有联系点；移除了 legalName、成立年份、完整地址、地理坐标与 LocalBusiness Schema，避免把尚无可核验原件的实体字段作为搜索结构化事实。首页与联系页仍保留单一 Organization Schema，真实产品、分类、多语言、询盘和后台路径未改变。

Google 建议 sitemap 包含希望出现在搜索结果中的 canonical URL，结构化数据须准确代表页面的主要可见内容；本轮使 noindex 状态、全局链接与 Schema 输出保持一致。[1](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) [2](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

## 验证

完整 Astro/Vercel 构建成功。英文工厂页输出 `noindex,nofollow`，JSON-LD、Organization 和 sitemap 收录均为零；英文首页保留一个 Organization Schema，不再输出 LocalBusiness、工业园完整地址、工厂预取或导航/页脚工厂链接。静态 sitemap 为 90 个 URL，博客 sitemap 为 1 个 URL，产品 sitemap 为 3,522 个 URL，根级 API 入口仍为五个。

## 后续证据需求

若要恢复工厂页全局入口或 LocalBusiness/地址类 Schema，应提供可公开核验的实体名称、可用办公/经营地址、联系范围、坐标来源、经营时间以及与对应页面一致的能力或认证资料。通过核验后，再按字段逐项恢复，不使用泛化的全站断言。

## 参考资料

1. Google Search Central, [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
2. Google Search Central, [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
