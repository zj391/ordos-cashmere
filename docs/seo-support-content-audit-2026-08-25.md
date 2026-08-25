# 支持内容页与工具页 SEO 审计

## 修复范围

下载中心原先列出固定证书、现场审核报告、资料包文件数和体积、样品退款、MOQ、运输术语与时效。FAQ 原先包含固定 MOQ、价格、付款、交期、认证、追溯和全球发货承诺。产品目录与工具型比较路径也把价格、MOQ、交期和样品数据展示为统一商业条件。

本轮将这些页面改为采购准备与书面项目确认：访客可比较页面呈现的产品属性，并提交产品参考、规格、数量、目的地、验货方式和文件需求；资料范围、商业条款、打样、交付与文件要求按项目确认。

隐私页中关于固定保留期、处理方、分析设置和 GDPR 适用性的具体法律性声明，已替换为面向具体询盘的隐私沟通说明，并设为 `noindex`。正式隐私政策仍应根据实际数据流、服务商和适用法域由合格法律专业人士审阅。

## 验证结论

英文与中文的下载中心、FAQ、隐私、博客与产品目录静态页均输出单一 H1 与 canonical。隐私页输出 `noindex`。下载与 FAQ 的抽样旧固定承诺在静态 HTML 中均为零；根级 API 入口维持五个。

## 参考资料

1. Google Search Central, [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) — 结构化数据应反映页面可见的主内容，不得误导。
2. Google Search Central, [Link best practices for Google](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) — 内部链接应使用可抓取的锚点与描述性文字。
3. Google Search Central, [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) — 内容应以用户需求、可核验事实和明确来源为优先。
