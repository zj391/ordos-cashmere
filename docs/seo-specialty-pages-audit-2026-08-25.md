# 颜色、原料、工艺与政策专题页 SEO 审计

## 审计结论

颜色卡、分梳羊绒、纱线类型与认证专题页含有尚未在当前资料中独立核验的季节目录、物理采样、固定色卡规模、认证、审核、测试、原料纯度、工艺设备、产能、MOQ、价格、库存、样品和交期声明。部分页面还将价格与库存写入 `Product` 或 `Offer` 结构化数据。

为保留页面的采购沟通入口，而不把未核验资料作为可索引事实发布，本轮将这四个专题页设为 `noindex,nofollow`。页面仍保留数字颜色参考、原料/纱线规格沟通和资料核验入口；实际规格、可用性、资料、颜色、检验、交付和商业条款均在具体项目的书面沟通、报价或协议中确认。

## 实施范围

认证页停止输出认证 `Organization` Schema、证书卡和认证背书，改为资料与核验请求。分梳羊绒页删除固定 `AggregateOffer`、库存和价格区间。纱线页隐藏固定库存、纱支范围、数量与交期数据。色卡页隐藏采样方法和完整目录下载区块，改为数字参考提醒。

## 验证结论

英文与中文的八个专题静态页面均输出单一 H1、canonical 和 `noindex,nofollow`。抽样静态 HTML 中固定 Offer、库存、MOQ 与交期标记为零；根级 API 入口保持五个。页面仍保留项目级书面确认提示。

## 参考资料

1. Google Search Central, [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
2. Google Search Central, [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
