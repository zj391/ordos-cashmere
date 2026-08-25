# 可索引页面与 Sitemap 一致性审计

## 审计结论

原 sitemap 生成器会把 `dist/client` 下的全部静态页面写入 sitemap。由于专题页、隐私页和询盘清单页已在 HTML 中输出 `noindex,nofollow`，这会将搜索引擎不应索引的 URL 同时作为 sitemap canonical 候选和 IndexNow 提交对象，造成相互矛盾的抓取信号。

Google 的 sitemap 指引要求 sitemap 包含希望出现在搜索结果中的 URL，并将 sitemap 内 URL 视为 canonical 提示。[1](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) [2](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) 因此，本轮不维护容易遗漏的硬编码路径表，而是由生成器读取已构建 HTML 的 `<meta name="robots">`，自动排除带有 `noindex` 的页面。生成器对 sitemap 和 IndexNow 共用同一套已过滤 URL 集合。

## 同时收敛的全局可见文案

页脚原先在所有可索引页面显示 ISO 9001、OEKO-TEX 与 GCS 认证，以及具体工业园地址，但当前资料未提供可独立核验的证书、适用范围或地址原件。本轮将其改为按项目书面请求提供资料，并收敛为区域级地址。全局产品导航同时移除了固定 100 件 MOQ、纱线支数范围、固定针型范围和贴牌承诺，改为项目或规格询盘入口；真实产品 URL、筛选链接、多语言导航和询盘功能均保持不变。

## 构建验证

完整 Astro/Vercel 构建成功。生成器发现 3,900 个可索引静态页面，并排除了 36 个 `noindex` 页面；sitemap 按静态页 96、博客页 282、产品页 3,522 分桶。检查确认 sitemap 中不含颜色卡、分梳羊绒、纱线类型、认证、隐私或询盘清单 URL；抽样页面均保留单一 canonical 与 `noindex,nofollow`。英文和中文首页已不再输出原认证串，改为项目资料书面沟通提示。根级 API 入口仍为五个。

## 后续证据需求

若需恢复任何认证、地址、MOQ、样品、运输、付款、针型或纱线范围的公开声明，业务方应提供适用产品、批次、日期、地区和责任主体均清晰的原始资料。获得资料后，应逐项恢复到相应页面，而不是在全站页脚或导航中作泛化断言。

## 参考资料

1. Google Search Central, [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
2. Google Search Central, [How to specify a canonical URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
3. Google Search Central, [Block Search indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
