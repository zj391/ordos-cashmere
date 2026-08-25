# 产品页 SEO 审计：目录和富结果结构化数据

## 审计结论

英文产品详情静态输出共 587 页，页面的 title、meta description 和 H1 均为 587 个唯一值；因此本轮没有对真实产品 URL 实施 noindex、删除或合并。产品目录页实际公开的是 66 个代表款，而基础布局中的 `ItemList.numberOfItems` 曾硬编码为 591，和实际目录内容及产品详情页数量不一致。

产品详情页同时在 JSON-LD Offer 中写入了所有 SKU 均“有库存”及固定至 2027 年的报价有效期，但这些状态并非页面可见的、逐 SKU 维护的事实。站点采用 B2B 询盘和定制报价模式，页面展示的是价格区间、MOQ、交期和询盘入口。

## 修复

产品目录结构化数据改为 `CollectionPage`，保留其真实页面标题、描述、规范 URL 和语言，而不再声明一个硬编码商品数量。产品详情继续保留 `Product`、价格或价格区间、货币、MOQ、卖方、材料和交期等页面可见的字段；移除了库存、固定报价截止日期和未在页面呈现的商业功能标记。

## 依据

Google 将 Product structured data 分为不可直接购买页面的 Product snippets 与可直接购买页面的 Merchant listings。结构化数据应真实代表页面主要内容，不应标注用户不可见、无关或可能误导的信息；丰富结果的出现也并不保证。

1. Google Search Central, [Introduction to Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product)
2. Google Search Central, [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
