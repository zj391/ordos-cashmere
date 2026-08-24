# SEO 审计工作记录

## 已核验的线上信号

| 项目 | 观察结果 |
|---|---|
| 首页 | `https://www.erdosdx.com/` 可抓取，标题为 “Erdos Cashmere Manufacturer | China Factory Direct | 23-Year | DONGXIAO®”。 |
| robots.txt | 允许公开抓取，屏蔽 `/api/` 与 `/admin/`，并声明了站点地图索引。 |
| sitemap-index.xml | 列出了静态页、博客与产品三个子站点地图。 |
| 现有基础 | 代码包含 canonical、hreflang、Open Graph 和 JSON-LD 生成逻辑。 |

## 初步风险点

1. 当前 `BaseLayout` 的默认 `ogImage` 指向通用图片，页面级调用若未覆盖，可能降低社交与图片结果的相关性。
2. 需进一步核验各类页面的 title/description 是否唯一且与可见 H1 语义一致。
3. 需核验站点地图中的 URL 总量、语言版本互链和产品/博客详情页的结构化数据覆盖。

## 已实施的高优先级修正

1. 将站点地图的路径语言代码映射为搜索引擎可识别的 hreflang 值：`kr` 映射为 `ko`，`cn` 映射为 `zh-CN`；URL 路径本身仍保持现有路由，不影响用户访问。
2. 为所有继承基础布局的页面输出绝对 `og:image`、`og:image:secure_url`、`og:image:alt` 与 `twitter:image:alt`。
3. 为通用 WebPage JSON-LD 补充 canonical URL 与 `primaryImageOfPage`，帮助搜索引擎识别页面代表图。

## 官方核验依据

Google 建议每个页面使用准确、简洁、非重复的 `<title>`，并让主视觉标题与页面主题一致。多语言页面的 hreflang 应包含自身、所有语言版本和 x-default；图像应使用标准 `<img>`、描述性 `alt` 文本、相关的页面上下文以及有代表性的 `og:image` 或结构化数据图像。[1][2][3]

## 参考资料

[1]: https://developers.google.com/search/docs/appearance/title-link "Google Search Central：Title links"
[2]: https://developers.google.com/search/docs/specialty/international/localized-versions "Google Search Central：Localized versions"
[3]: https://developers.google.com/search/docs/appearance/google-images "Google Search Central：Image SEO"
