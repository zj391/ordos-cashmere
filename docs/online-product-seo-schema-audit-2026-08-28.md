# 公开线上产品页 SEO 与 Schema 审计（2026-08-28）

## 范围与来源

本记录仅检查公开线上响应，不写入或发布任何线上环境。公开 [`robots.txt`](https://www.erdosdx.com/robots.txt) 指向 [`sitemap-index.xml`](https://www.erdosdx.com/sitemap-index.xml)；后者列出 [`sitemap-products.xml`](https://www.erdosdx.com/sitemap-products.xml)。检查时 sitemap 索引的更新时间为 `2026-08-28T01:10:37.343Z`。

完整公开产品 sitemap 下载体积为 6,930,033 字节，包含 3,522 条唯一产品 URL：`en`、`cn`、`de`、`fr`、`ja`、`kr` 各 587 条；其中有 20,922 个 image sitemap 节点。代表页 [`/en/products/yarn-106/`](https://www.erdosdx.com/en/products/yarn-106/) 已可见最新的长尾 H1、规格账本、项目书面确认和质量准备路径，说明线上响应并非停留在早期产品页版本。

## 全量只读审计结果（修复前的公开响应）

审计脚本以 12 路受控并发抓取上述 3,522 个公开 URL，逐页检查 `<title>`、元描述、canonical、hreflang、robots、H1、可解析 JSON-LD、Product JSON-LD、BreadcrumbList，以及 Offer/价格/库存和已列旧断言词。

| 项目 | 初步观察 |
|---|---:|
| sitemap URL 总数 | 3,522 |
| 每个语言 URL 数 | 587 |
| `BreadcrumbList` 重复（2 个） | 3,480 页 |
| `Product` Schema 缺失 | 30 页 |
| 元描述超过 160 字符 | 15 页 |
| 请求超时（20 秒） | 12 页 |
| Offer/价格货币/库存或指定旧断言 | 本次汇总未报告命中 |

`Product` Schema 缺失的 30 条 URL 与 sitemap 中的 30 个分类枢纽相符（5 个分类 × 6 种语言）；它们并不是产品详情页，因而不能作为产品详情 Schema 回归判定。代表页的线上 JSON-LD 实测输出 2 个 `BreadcrumbList`。当前产品详情模板仍将专用产品面包屑放入 `customSchemas`，但未传入 `suppressDefaultBreadcrumb`，这是系统性重复面包屑的最可能来源，需在本地构建和线上复核后再作出修复判断。

12 个超时属于审计连接时限，不等同于页面返回错误。线上审计中没有报告标题缺失、canonical 偏差、hreflang 缺失、robots noindex、JSON-LD 解析失败、Offer/价格货币/库存字段或指定旧断言词；系统性异常集中于重复 `BreadcrumbList`。前述 15 条超长描述均来自英文、德文、法文的五个分类枢纽，而非产品详情页。

## 已完成的本地修复与静态复核

产品详情页已传入 `suppressDefaultBreadcrumb={true}`：它保留专用的四级产品面包屑，并阻止基础布局再输出默认面包屑。英文、德文、法文的分类枢纽共享元描述也已压缩为“已列属性 + 项目书面确认”语义，长度不超过 160 个字符。

使用构建后的 `sitemap-products.xml` 为唯一清单重新审计本地静态产物，结果为 **3,522/3,522 通过**：其中 3,492 条为产品详情页、30 条为分类枢纽；每条详情页均有且仅有一个 Product JSON-LD 和一个 BreadcrumbList，分类枢纽不输出 Product JSON-LD。所有路由均保留 H1、尾斜杠 canonical、六语 hreflang 与 x-default、元描述、可解析 JSON-LD；产品详情页不含 Offer/价格货币/库存 Schema 或指定旧断言。完整生产构建和 sitemap 生成也已通过。

这说明 GitHub 当前修复版本的静态输出已符合本审计契约；公开站点仍需在发布平台获取该提交后，以代表产品页复核单一 BreadcrumbList。审计过程不会直接操作线上环境。

## GitHub 同步后的公开响应复核

GitHub `master` 同步后，公开 sitemap 的更新时间刷新为 `2026-08-28T01:29:18.018Z`。线上代表页 `/en/products/yarn-106/` 的公开 HTTP 响应已从 2 个 BreadcrumbList 刷新为 **1 个 Product、1 个 BreadcrumbList、0 个 Offer/价格货币/库存相关字段**。对前次高并发审计中超时的中文围巾、中文毛衫、德文围巾及英文围巾代表 URL 进行低并发复核，均得到相同的 `1 / 1 / 0` 结果。

修正分类枢纽口径并延长单请求时限后，第二次线上全量读取成功检查 **3,484/3,522** 条 URL，所有成功读取页面均通过 title、元描述、canonical、hreflang、robots、JSON-LD、Product/Breadcrumb 数量和禁止字段检查。其余 38 条是传输层结果（37 个 `AbortError`、1 个 `TypeError`），未产生任何标签或 Schema 失败；低并发样本复核显示这些为高并发读取时延，而非可复现的页面结构错误。

因此，结论应表述为：**公开站点已可观察到本次 Schema 修复，且全部成功读取的线上产品 URL 均符合审计契约；本地静态 sitemap 全量 3,522 条为 100% 通过。** 由于 38 条线上请求在批量读取中未返回，不能将公开网络层结果表述为 3,522/3,522 已逐条成功读取。
