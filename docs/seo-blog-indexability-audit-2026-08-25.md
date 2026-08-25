# 博客正文、Article Schema 与内容集群索引审计

## 审计发现

内容集合包含 282 篇 Markdown 文章。风险扫描发现其中 268 篇含有至少一种当前无法独立核验的供应商或商业断言，例如固定价格、MOQ、交期、样品、认证、测试、产能、地域覆盖、库存或色卡时效。剩余文章也未在当前资料中形成逐篇可复核的引用与适用范围链路。

旧博客模板会为所有文章输出可索引 canonical、`BlogPosting`、FAQ Schema、作者/日期元数据，并由博客枢纽和内容集群直接内链；这会将历史断言作为搜索事实、富结果候选和站内权威路径放大。

## 实施

新增集中式博客白名单。目前仅英文 `cashmere-test-report-checklist-b2b-buyers` 文章被保留为可索引知识页，因为该页已有独立审阅的来源、检查清单、采购语境和主题内链。其余历史文章的 URL、正文、路由和可用访问路径均保留，但模板输出 `noindex,nofollow`，且不再输出 `BlogPosting`、FAQ 或面包屑 Schema。

博客枢纽仅收录白名单文章，并将原有未核验的英语知识集群入口隐藏。没有已审阅文章的语言版本保留博客枢纽 URL，并向访客说明历史内容正在按来源、适用范围和采购断言逐篇审阅。文章页的固定“24 小时回复”承诺也改为项目范围和条件书面确认提示。

Google 说明 `noindex` 应通过对抓取器可见的 meta 标签或 HTTP 响应头提供，且不应由 robots.txt 阻断；Google 的 sitemap 指引要求只纳入希望出现在搜索结果中的 URL。[1](https://developers.google.com/search/docs/crawling-indexing/block-indexing) [2](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

## 验证

完整 Astro/Vercel 构建成功。生成器发现 3,619 个可索引页面，并从 sitemap/IndexNow 集合排除 335 个 noindex 页面；博客 sitemap 从 282 个 URL 收敛为 1 个经审阅文章 URL。该文章无 noindex、保留一个 `BlogPosting` Schema 且在英文博客枢纽显示；抽样历史文章输出 noindex 且 `BlogPosting` Schema 为零，且不在博客 sitemap 或英文枢纽中。根级 API 入口仍为五个。

## 后续证据要求

要逐篇恢复博客索引，业务方应提供与文章主张相称的原始资料：引用链接、发布日期与作者责任、认证范围/有效期、测试或检验报告、实际适用产品、市场/法规依据，以及与采购条款相关的书面项目范围。每篇完成审核后，应加入白名单，再恢复其 Article Schema 和博客枢纽链接。

## 参考资料

1. Google Search Central, [Block Search indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
2. Google Search Central, [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
