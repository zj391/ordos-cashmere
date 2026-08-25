# 产品标题扩充与搜索语义审计

## 目标与边界

本轮不逐条覆写产品原始名称，也不使用生成式文案补造产品事实。产品标题由现有目录字段动态组合：原始产品名称承载 SKU 级差异；仅当原名称中未出现时，追加现有 `material` 与 `micron` 字段；页面 `<title>` 再以前置的本地化分类词和简短品牌尾缀建立页面主题。

规则明确排除认证、价格、MOQ、库存、样品、交期、产能、地区覆盖和性能断言。此方式可随后台产品名称或规格更新自动生效，同时不会改变产品 ID、URL、图片、询盘数据或产品原始字段。

Google 建议每个页面均有 `<title>`，标题应描述性、简洁、区分页面内容并避免关键词堆砌；它还会综合 `<title>`、主视觉标题、H1 和页面其他文本生成搜索结果标题。[1](https://developers.google.com/search/docs/appearance/title-link) 因此本轮将同一产品级扩充名称用于 H1、`Product.name` 和面包屑末项，并使 `<title>` 使用同一语义来源。

## 覆盖与验证

目录中共有 582 个原始产品记录，所有记录都有名称、材质、细度、详细描述和标签；原始精确名称不存在重复。构建后每种语言有 587 个 `/products/` 静态路径，其中五个是既有分类枢纽路由（`accessories-cat`、`garment-oem`、`hats-accessories`、`scarves`、`yarn`），并非产品详情页。

其余 582 个产品详情页在英文、德文、法文、日文、韩文和中文中均拥有单一 `<title>`、单一 H1、单一 canonical、Product JSON-LD、零个重复 title 和零个重复 H1。实际页面 `<title>` 长度在 20–78 个字符范围内，按单一扩充规则动态生成。产品 sitemap 保持 3,522 个 URL，根级 API 入口保持五个。

## 维护规则

后续新增或修订产品时，优先维护原始产品名称、材质与细度字段。标题系统会自动消费这些字段；如某规格尚未能独立核验，应留空或在项目书面沟通中确认，而不是把固定商业术语写入名称、标题或 Schema。

## 参考资料

1. Google Search Central, [Influencing your title links in search results](https://developers.google.com/search/docs/appearance/title-link)
