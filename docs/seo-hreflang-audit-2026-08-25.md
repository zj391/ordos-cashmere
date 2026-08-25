# 技术 SEO 审计：博客 hreflang 与规范 URL

## 发现

新增的英文博客文章仅有英文静态页面，但其 HTML 头部此前输出了六种语言的 `hreflang`，其中德语、法语、日语、韩语与中文目标均不存在。与此同时，站点使用 `trailingSlash: 'always'`，而这些 HTML hreflang URL 未带尾斜杠，和 canonical 与 sitemap 的首选 URL 不一致。

## 修复

博客详情页在构建时按 slug 汇总真正存在的语言版本，并将该列表传入基础布局。基础布局只为这些版本输出 HTML hreflang；对单语言文章，保留自身语言与指向英文的 `x-default`。`generateHreflangs` 也统一输出带尾斜杠的绝对 URL。静态多语言页面未传入过滤列表，继续保留六语言互链。

## 依据

Google Search Central 说明，`hreflang` 集合应包含页面自身和实际替代页面；互相缺失返回链接的标注可能被忽略。Google 也建议对首选 URL 保持内部链接、sitemap 与规范信号的一致性，且斜杠与非斜杠 URL 被视为不同 URL。

1. Google Search Central, [Tell Google about localized versions of your page](https://developers.google.com/search/docs/specialty/international/localized-versions)
2. Google Search Central, [To slash or not to slash](https://developers.google.com/search/blog/2010/04/to-slash-or-not-to-slash)
