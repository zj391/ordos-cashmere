# 产品详情页商业字段与 Product 结构化数据 SEO 审计

## 修复范围

产品详情模板此前同时在元描述、价格卡、规格表、比较表、FAQ、询盘反馈、物流区、相关推荐和 `Product` JSON-LD 中输出固定价格、MOQ、交期、样品、库存、贸易术语或服务时效。模板还含有三条没有可核验来源的客户评价与评分。

本轮移除了 `Offer`、`AggregateOffer`、`eligibleQuantity`、库存及固定商业条件的结构化数据。产品页面仍保留产品名称、SKU、材质、细度、图片、分类与实际规格；采购方应提供产品参考、目标规格、数量、目的地、验货方式和文件需求，商业条件在书面沟通、报价或销售协议中确认。

## 内容与内链调整

详情页的固定物流区、价格对比表和虚构客户评价已删除。相关推荐仍保留材质、分类和产品名称，但不再显示价格或 MOQ。统一的三条六语采购问答取代固定 MOQ、交期、样品和品牌定制答复。

## 验证结论

生产构建完成并生成四份 sitemap。英文、中文、德语、法语、日语和韩语产品样本均有一个 H1 和一个 canonical。抽样静态 HTML 中 `Offer`、库存、固定商业条件、固定物流时效和未验证评价标记均为零；根级 API 入口维持五个。

## 参考资料

1. Google Search Central, [Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product)
2. Google Search Central, [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
