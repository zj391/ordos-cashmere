# 产品列表、筛选与内部链接发现路径审计

## 官方抓取原则

Google 指出，查询参数实现的分面筛选可能生成大量近似 URL，造成过度抓取并延缓新内容发现。若筛选 URL 不需要进入搜索结果，应限制其抓取；若确有索引价值，则需使用标准参数、固定逻辑顺序、有效结果页和清晰的 canonical 策略。[1](https://developers.google.com/crawling/docs/faceted-navigation) [2](https://developers.google.com/search/docs/crawling-indexing/url-structure)

本站的 `?cat=`、`?byStyle=`、`?byMaterial=`、`?byUse=` 等参数由客户端标签规则生成。标签以产品名称、材质、描述与标签的子串匹配为主，部分还依赖机号或支数正则；它们适合访客即时缩小目录，但并不是独立维护的、具独特正文的静态落地页。因此本轮不会把这些参数组合加入 sitemap 或作为新的可索引页面。

## 实施方向

产品总列表页新增指向五个稳定分类枢纽的静态发现模块。锚文本按分类承接真实产品类型与款式，例如帽子/毛线帽/贝雷帽/帽型、围巾/披肩/方巾/斗篷、羊绒衫/开衫/背心、打底裤/手套/袜子和筒纱/绞纱/针织/机织。参数筛选仍可供用户使用，但导航参数链接带 `rel="nofollow"`，并由 robots 规则限制主要分面参数的抓取发现。

列表页还停止将固定价格、MOQ、交期和色卡承诺传入动态卡片、比较表或询盘选择。访客仍可比较类别、材质和细度，并将选定产品加入询盘清单；数量从 1 开始，适用商业条件在项目书面沟通中确认。

## 构建验证

完整 Astro/Vercel 构建成功。六语产品列表页均有一个 `<title>`、一个 H1、一个 canonical，且每页均含五个稳定分类枢纽链接。静态 HTML 中固定价格、数值 MOQ、Offer、库存、`priceValidUntil` 和色卡时效提示的命中数为零；筛选链接中有 336 个 `rel="nofollow"` 标记，robots 中有 11 条分面参数限制规则。sitemap 仅保留六个标准产品列表 URL，产品 sitemap 保持 3,522 个 URL，根级 API 入口保持五个。

## 参考资料

1. Google, [Managing crawling of faceted navigation URLs](https://developers.google.com/crawling/docs/faceted-navigation)
2. Google Search Central, [URL structure best practices](https://developers.google.com/search/docs/crawling-indexing/url-structure)
