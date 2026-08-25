# 核心入口页元数据与采购承接 SEO 审计

## 修复范围

首页、原料、纱线/面料与成衣 OEM 页此前在摘要、数据带、FAQ 或采购流程中混合了固定认证、客户/地区覆盖、产能、库存、MOQ、样品、交期、价格、付款和售后条件。其中部分字段带有占位说明，或无法在当前资料中独立核验。

本轮将页面主旨统一为采购准备与书面项目沟通。访客需要提供产品参考、规格、数量、目的地、打样用途、验货方式与文件需求；MOQ、价格、样品、交期、付款、交付和售后条件仅在具体项目的书面报价或销售协议中确认。

## SEO 实施

六语首页与三个核心产品入口页的标题和元描述已去除固定认证、产能、服务范围、免费样品、MOQ 和时效型摘要承诺。首页信任条带改为采购准备清单，产品卡改为项目资料字段；原料、纱线/面料与成衣 OEM FAQ 改为项目级核验问题。

## 验证结论

Astro/Vercel 生产构建完成，四份 sitemap 成功生成。英文和中文的首页、原料、纱线/面料、成衣 OEM 静态页均有一个 H1 和一个 canonical 链接。根级 API 入口维持五个。

## 参考资料

1. Google Search Central, [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
2. Google Search Central, [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
