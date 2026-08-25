# FAQ、资料入口与采购流程辅助页面索引审计

## 审计发现

FAQ、下载、付款讨论、物流准备和私牌采购讨论页已经使用项目级书面确认来承接采购问题；其中 FAQ 实际输出的是收敛后的四项多语言问答，并非源码中未调用的历史 `legacyFaq` 数据。

工厂页则仍可索引地展示大量当前没有原始资料支撑的固定断言：场地、员工、产能、出口国家、设备数量、认证清单、来访时效、全球覆盖和直接定价。分类枢纽的最终 CTA 也仍承诺“24 小时内提供 FOB/CIF 报价”。

## 实施

工厂页保留原 URL、导航和访客访问能力，但设置为 `noindex,nofollow`，直至业务方提供可公开核验的能力、设备、认证、地址、访问安排和适用范围资料。sitemap 生成器自动检测该 robots 指令，因此不会继续将六语工厂页提交为可索引 canonical URL。

五类分类枢纽的 CTA 改为采购需求准备提示：采购方提交目标数量、规格方向、目的地和资料需求；报价、贸易术语、交付和文件范围在具体项目中书面确认。真实分类 URL、产品链接、下载入口、询盘入口和多语言路由均保持不变。

Google 说明 `noindex` 必须在可抓取页面中向爬虫可见，并且 sitemap 应只包含希望出现在搜索结果中的 URL。[1](https://developers.google.com/search/docs/crawling-indexing/block-indexing) [2](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

## 验证

完整 Astro/Vercel 构建成功。构建后工厂页输出 `noindex,nofollow`，且在静态 sitemap 中数量为零；配饰分类页中“24 小时”与“FOB/CIF 报价”命中数为零，项目书面确认提示为一。FAQ 保持可索引，仍有单一 FAQPage Schema。静态 sitemap 为 90 个 URL，博客 sitemap 为 1 个 URL，产品 sitemap 为 3,522 个 URL，根级 API 入口仍为五个。

## 后续证据需求

若要恢复工厂页索引，需提供可公开核验、且标明责任主体、地址/地点、适用产品范围、签发日期和有效期的材料，包括能力/设备记录、证书或审核报告、访问政策和商业服务范围。收到材料后，应逐项恢复可索引声明，而不是使用全站泛化文案。

## 参考资料

1. Google Search Central, [Block Search indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
2. Google Search Central, [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
