# 分类页长尾标题架构优化审计

## 采用的标题层级

本轮不继续把全部长尾属性压入单个产品 H1。公开头部羊绒网站的产品和集合页通常将产品名、材质、产品类型、款式/领型、筛选属性和支持性内容分层：产品页保留 SKU 级差异，集合页承接更宽的类型与款式发现需求。[1](https://us.loropiana.com/en/c/man/knitwear) [2](https://johnstonsofelgin.com/collections/women-all) [3](https://www.eric-bompard.com/en-us/collections/pulls-femme)

本站因此把更丰富的长尾覆盖放入五类分类枢纽的六语 `<title>` 与 H1：帽子页覆盖帽子、毛线帽、贝雷帽、帽型、罗纹、麻花与提花；围巾页覆盖围巾、披肩、方巾、斗篷、梭织、印花与提花；羊绒衫页覆盖套头衫、开衫、背心、圆领、V 领和麻花针织；配饰页覆盖打底裤、手套、袜子和针织配饰；纱线页覆盖筒纱、绞纱、针织与机织产品记录。

这些词均来自目录中已有的产品名称或直接属性。产品详情仍保留之前的名称、材质、细度、款式、领型、织法、人群、季节与尺寸规则，不复制竞品标题，也不增加认证、价格、MOQ、库存、样品、交期、产能、服务地区或性能断言。

## 同步的内容收敛

分类卡片、打底裤专题和交叉分类链接不再可见输出固定 USD 价格、MOQ 或不自然的关键词串。它们改为产品记录、已列属性和项目级书面确认的自然导览；原始产品详情 URL、图片、产品数据、询盘入口、多语言路由、canonical 与分类筛选链接均保持不变。

## 验证

完整 Astro/Vercel 构建成功。五类分类枢纽的六种语言共 30 个页面均有一个 `<title>`、一个 H1、一个 canonical 和书面项目确认提示；分类静态 HTML 中固定价格/MOQ、Offer、库存与 `priceValidUntil` 标记均为零。sitemap 中保留 30 个真实分类枢纽 URL，兼容别名 URL 为零；产品 sitemap 仍为 3,522 个 URL，根级 API 入口仍为五个。

## 参考资料

1. Loro Piana, [Men’s Knitwear](https://us.loropiana.com/en/c/man/knitwear)
2. Johnstons of Elgin, [Women’s Collection](https://johnstonsofelgin.com/collections/women-all)
3. Eric Bompard, [Women’s Cashmere Jumpers](https://www.eric-bompard.com/en-us/collections/pulls-femme)
4. Google Search Central, [Influencing your title links in search results](https://developers.google.com/search/docs/appearance/title-link)
