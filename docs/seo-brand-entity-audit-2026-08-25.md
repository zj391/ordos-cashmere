# 品牌实体与联系页 SEO 审计：可验证 Schema

## 修复原则

本轮将全站 `Organization` 与 `LocalBusiness` 标记收敛到首页、联系页和工厂页，并仅保留网站可见的基础组织名称、法定名称、地址、电话、邮箱、网址和标志。无法在当前仓库中独立核验的社交身份链接、全球服务范围、创始人、行业分类代码、专业能力列表、固定营业时间和响应时效不再作为结构化数据或联系页承诺输出。

联系页保留真实联系渠道，并将行动引导改为采购方可提供的产品链接、数量、目的地和规格需求；交易后的答复节奏、付款、样品、交付或报价均以书面沟通为准。

## 官方依据

Google 建议将 Organization 标记部署于首页或单一组织介绍页，并添加真正适用于组织和用户有用的属性，例如名称、地址、电话、邮箱、网址和标志。[1]

Google 的通用结构化数据指南要求标记真实代表页面可见内容，不得隐藏、无关、误导或虚构组织信息。[2]

Schema.org 将 `sameAs` 定义为能无歧义表明实体身份的参考页面 URL；因此只有经过确认的官方资料页才适合加入此属性。[3]

## 参考资料

1. Google Search Central, [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
2. Google Search Central, [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
3. Schema.org, [sameAs](https://schema.org/sameAs)
