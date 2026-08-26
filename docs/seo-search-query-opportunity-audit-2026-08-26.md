# 搜索查询数据驱动的关键词机会审计

## 输入与数据质量

本次分析使用业务方提供的查询导出。文件中有 108 行，其中末行缺少完整指标，已在可重复运行的分析脚本中自动排除。有效样本包含 107 条查询、5 次点击、473 次展示和 1.06% 的加权点击率。

脚本按品牌导航、产品发现、B2B 商业、知识问题和非相关/竞品意图聚类，并将展示量、平均排名窗口和点击缺口合成为排序机会分数。脚本位于 `scripts/seo/analyze-query-performance.mjs`，可在下一次 Search Console 导出后重新运行。

## 优先映射

| 查询主题 | 数据信号 | 已有真实目录证据 | 本轮目标页面与处理 |
|---|---:|---:|---|
| `kaschmir turtleneck` | 58 展示，平均排名 28.6 | 目录中有 64 处高领产品记录 | 德语与英语羊绒衫分类页补充 Turtleneck/高领标题和关键词 |
| `100 cashmere shawl`、`cashmere shawl` | 54 展示，平均排名 20.6–29.0 | 目录中有 234 处 shawl 记录，483 处 `100% Cashmere` | 英语围巾/披肩分类页继续以 scarves、wraps、shawls 与款式属性承接，不追加未核验商业词 |
| `cashmere leggings`、`leggings cashmere` | 47 展示，平均排名 13.4–21.9 | 目录中有 21 处 leggings 记录 | 配饰分类页保留专门的 leggings/tights/trousers 可见模块和产品记录入口 |
| `worsted cashmere yarn` 等纱线词 | 多个相关查询，共 106 展示 | 目录含 172 处 worsted、32 处 woolen、224 处 cone、70 处 hank | 纱线分类页补充 worsted、woollen、cone、hank、knitting、weaving 的真实产品记录语义 |
| `odm コート` | 14 展示，平均排名 14.9 | 现有成衣 OEM 页面与目录已有 coat/衣料类型 | 日语成衣 OEM `<title>` 补充 `コート` 与对应关键词，保持项目书面沟通语境 |
| `erdos cashmere`、`erdos clothing` | 54 展示，已有 5 次品牌点击 | 首页已有 Ordos 与产品类别信息 | 英语首页标题调整为 Ordos Cashmere Product Catalogue，摘要补足目录中的原料、纱线、面料、针织、围巾与配饰 |

## 有意排除的词

不将 `price per kilo`、`cashmere yarn sale`、`clearance`、`deadstock`、`MOQ`、`official shop`、竞争品牌名或供应商名写入标题、Schema 或可索引正文。它们要么要求当前没有独立证据支持的价格/可用性/条款，要么属于不应承接的竞争品牌或售后交易意图。

同样，本轮不为法语“2 fils ou 4 fils”、护理/熨烫、质量等级等知识问题创建薄内容页；这些主题需要逐篇可引用的技术资料，完成审核后再成为新的可索引知识内容。

Google 建议标题准确描述页面内容、保持区别性并避免关键词堆砌；因此每个词组都映射到已有的分类、产品目录或品牌页，而非生成参数组合或重复落地页。[1](https://developers.google.com/search/docs/appearance/title-link)

## 验证

完整 Astro/Vercel 构建成功。最终静态 HTML 中：英文/德语羊绒衫分类页均有 Turtleneck 词，英语围巾页有 cashmere shawl 词，英语配饰页有 cashmere leggings 词，英语纱线页有 Worsted 词，英文首页有 Ordos Cashmere Product Catalogue，日语成衣 OEM 页有 `コート`。围巾页已不再链接至色卡、分梳羊绒、纱线类型或工厂等 noindex 专题。静态 sitemap 为 90 个 URL，根级 API 入口为五个。

## 参考资料

1. Google Search Central, [Influencing your title links in search results](https://developers.google.com/search/docs/appearance/title-link)
