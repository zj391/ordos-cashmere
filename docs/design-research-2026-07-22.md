# 羊绒/纺织品 B2B 同类网站首页视觉调研报告

> 调研日期：2026-07-22。结论仅基于本次实际打开的页面、页面可访问文本结构与浏览器截图；无法访问的站点不作“已观察到”的断言。

## 1. 调研方法

使用 `browser_navigate` 逐一打开用户指定的 10 个首页，并用 `browser_snapshot` 读取可访问性树、用 `browser_vision` 查看实际渲染截图；对能访问的页面记录导航、首屏构图、图片类型、色彩和 CTA。额外用 `curl` 做连通性诊断。访问对象：Maysun Group、Natuzzi Furs、Cashmere of the UK、Inner Mongolia Cashmere、Cashmere Works、Tianli Cashmere、Scabal、Dormeuil、Holland & Sherry、Loro Piana。

## 2. B2B 工厂站：共性与差异

### 实际访问结果与可核验信息

|站点|本次首页结果|可核验视觉信息|
|---|---|---|
|Maysun Group|失败：浏览器 `ERR_CONNECTION_CLOSED`，curl DNS 无法解析|无法可靠评价，不以记忆补充|
|Natuzzi Furs|失败：`ERR_CONNECTION_CLOSED`，curl DNS 无法解析|无法可靠评价|
|Cashmere of the UK|失败：`ERR_CONNECTION_CLOSED`，curl DNS 无法解析|无法可靠评价|
|Inner Mongolia Cashmere|失败：`ERR_CONNECTION_CLOSED`，curl DNS 无法解析|无法可靠评价|
|Cashmere Works|实际打开，但被 Cloudflare 拦截|页面显示 “Sorry, you have been blocked”，无首页视觉可用|
|Tianli Cashmere|失败：`ERR_CONNECTION_CLOSED`，curl DNS 无法解析|无法可靠评价|

因此，6 个工厂/羊绒源头站中，本次没有一个能提供完整可核验的首页设计证据。不能把行业惯例冒充这些站点的实测结论。对 erdosdx.com 的工厂站判断，应把“真实供应能力的可视化”作为重点，而不是简单复制未知竞品。

### 三类可供改版参考的工厂站风格画像（策略画像，不指称上述失败站点）

1. **证据型工厂档案**：首屏用原料、分梳/纺纱/染色/成衣工艺照片，下面接产能、认证、出口地区、MOQ、交期；适合 B2B 询盘，可信度来自数据和可追溯链路。
2. **材料目录型**：以纱线、面料、针织品分类卡片和参数筛选为主；视觉应克制，重点是克重、支数、成分、颜色和样卡申请，不要用过多促销色。
3. **品牌工厂型**：以大幅牧场/山地/羊绒纤维影像建立高级感，再用“从原绒到成衣”的叙事承接产品目录；适合同时服务品牌客户和采购商，但 CTA 必须明确指向“获取目录/索样/预约工厂”。

## 3. 高端面料 B2B 站：共性

### Scabal（https://scabal.com/）

- **色彩**：顶部公告和页脚是深墨蓝，近似 `#082432`；主体近白 `#FFFFFF`，正文/标题是深海军蓝 `#002B45`；销售提示使用红色近似 `#E1262D`。
- **字体**：标题为全大写、宽字距的现代无衬线；正文和副标题带明显高端衬线感。具体字体名未在可访问树中暴露，不能冒充字体识别结果。
- **排版**：首屏是全宽大图 hero，人物居中，中央叠加 “SUMMER SALE / SHOP NOW”；之后是白底标题+四列产品分类卡，再接大图/拼贴网格、品牌能力和 made-to-order 叙事。
- **摄影**：暖米色室内、模特 lifestyle 与浅色产品白底图结合；后段出现复古车内、配饰等生活方式场景。不是工厂纪实，而是“穿着结果”与“品位场景”。
- **UI**：顶部促销条；logo+水平导航（SALE、SHOP、FABRICS、HERITAGE、STORES、MADE TO ORDER、NEWS）；右侧国家/语言、搜索、Concierge、门店、账户、购物袋。CTA 多为白底深字或深蓝底白字矩形按钮，表单为细线输入框+箭头提交；页脚四列链接、社媒和 newsletter。
- **差异化**：把“面料品牌”做成完整生活方式品牌；“FABRICS”和“MADE TO ORDER”并列，兼顾专业采购与终端体验。

### Dormeuil（https://dormeuil.com/）

- **色彩**：大面积白底 `#FFFFFF`、黑色 logo/文字近 `#050505`；核心 CTA 使用深绿近似 `#18513F`；hero 为冰川冷蓝/黑色渐变，工艺图为黑白。
- **字体**：logo 为几何无衬线大写；导航为简洁无衬线；中文正文为系统黑体/网页中文 sans，信息清晰。
- **排版**：顶部居中的 logo+双层导航；首屏为带上下黑色遮罩的宽幅视频/影像；下方两张并列入口“面料”“服装与配饰”，再接全宽黑白量身定制图、品牌历史双栏、通讯区和简洁页脚。
- **摄影**：材料特写（面料卷/织物）、产品静物、冰川冒险 lifestyle、黑白裁缝工艺纪实，形成“自然—材料—手工—定制”的证据链。
- **UI**：搜索在左、登录/语言在右；主导航强调“面料、服装与配饰、巴黎定制、东京精品店、专业、新闻”；CTA 是深绿实心或白底细边框；页脚为快速链接、社媒、支付方式。
- **差异化**：用黑白工艺照片和“1842”历史资产把工厂/定制能力转成高级品牌叙事；视觉不像普通电商。

### Holland & Sherry（https://www.hollandandsherry.com/）

- **色彩**：首页极简白底 `#FFFFFF`；logo/标题为深蓝灰近似 `#16243A`；左侧 Apparel 的米金字近似 `#E7C89A`，右侧 Interiors 为白字。图片本身是深炭黑、海军蓝、灰绿、棕红等织物色。
- **字体**：品牌 logo 为细几何无衬线、宽字距；入口标题同样全大写宽字距，地点副标题为较小无衬线。
- **排版**：不是传统滚动首页，而是品牌 logo 上方留白后，两个等宽并列的大入口：APPAREL / Savile Row • London 与 INTERIORS / New York City。属于“分流式双入口”，没有传统卡片、按钮和复杂页脚。
- **摄影**：两张织物/纺织表面特写，左图深色西装面料与织唛，右图多色竖向织物条；强调材料触感、纹理与色谱，而非模特。
- **UI**：入口本身即 CTA，横线分隔标题与地点；极少组件、极少文案。
- **差异化**：用两个业务世界和两个城市完成定位，极端克制；非常适合“品牌先分流，业务后展开”的高端入口逻辑。

**高端面料站共性**：深色品牌色+白底留白；首屏用一张强图或少量材料图建立品质；导航把 Fabric/Collection、定制服务、品牌历史、门店/询盘分开；按钮采用矩形、低圆角或无圆角、少渐变；页脚承担服务、法律、社媒和订阅，而不是堆满供应商徽章。

## 4. 奢华零售参考：Loro Piana（https://www.loro-piana.com/）

本次浏览器访问失败：`ERR_SSL_PROTOCOL_ERROR`；curl 也发生 Schannel TLS 错误，因此没有把其当前首页的色彩、字体或模块结构写成实测事实。作为后续人工补采优先项。可借鉴方向只能写成待验证假设：高密度材质摄影、暖中性色、低干扰导航和极简商品呈现；上线前应以可访问截图复核。

## 5. 5 个最具代表性的标杆案例（截图/URL）

1. **Scabal**：https://scabal.com/ —— 本次成功截图；“全宽 lifestyle hero + 产品分类网格 + made-to-order + 深蓝页脚”。
2. **Dormeuil**：https://dormeuil.com/ —— 本次成功截图；“材料特写 + 黑白工艺纪实 + 定制服务”。
3. **Holland & Sherry**：https://www.hollandandsherry.com/ —— 本次成功截图；“双业务入口 + 织物纹理特写 + 极简留白”。
4. **Cashmere Works**：https://www.cashmereworks.com/ —— 本次实际截图为 Cloudflare 拦截页；它是“访问治理会直接影响调研与获客”的反例。
5. **Loro Piana**：https://www.loro-piana.com/ —— 本次连接失败，列为待补采标杆，不宣称已截图。

## 6. 针对 erdosdx.com 的视觉改版建议

### 参考组合
- **参考 Dormeuil**：把羊绒供应链拍成“原料—分梳—纺纱—染色—针织—检验”的黑白/低饱和证据叙事；在首页直接放认证、设备、产能和可追溯入口。
- **参考 Scabal**：采用全宽首屏但把 CTA 改成 **Request Sample / Download Capability Deck / Talk to a Specialist**；下方用四列产品分类（Cashmere Yarn、Knitted Fabric、Garments、Private Label）。
- **参考 Holland & Sherry**：首屏或第二屏设置“Wholesale / Custom Manufacturing”双入口，按客户需求分流，不让采购商在品牌故事中迷路。

### 规避廉价 B2B 感陷阱
避免蓝色渐变、过多圆角按钮、廉价 stock 羊群图、工厂外观远景、无数据的“Best Quality/Professional”口号、首页密集 logo 墙、低清产品图、红黄绿促销色、自动弹窗和无目的轮播。不要把 MOQ、交期、认证藏在 PDF 深处。

### 配色建议
- 主色：深松针墨绿 `#173C35`（比常见企业蓝更像天然纤维，也能承载 CTA）。
- 辅色：羊绒米 `#D8C6A5`、铜棕 `#9A6A45`（只用于线条、标签、局部强调）。
- 中性色：骨白 `#F7F4EE`、暖灰 `#E8E4DC`、炭黑 `#1F2422`。整体控制在 1 个主色+1 个金属/暖色 accent，保证样卡和摄影是主角。

### 字体建议
标题使用高对比但不过度装饰的衬线（如 Cormorant Garamond/可商用同类）或品牌定制 serif；导航、参数、按钮使用 Inter、Manrope 或 Source Sans 3。中文建议思源宋体用于品牌叙事、思源黑体用于参数与导航。标题字距略放宽，正文保持 1.6–1.8 行高。

### 摄影风格
建立三套统一图组：① 纤维/纱线/织物宏观纹理，侧光、低饱和；② 工艺与质检黑白纪实，真实人员和设备；③ 面料/成衣在自然环境中的克制 lifestyle。所有产品图统一背景骨白、阴影方向和裁切比例；少用过度磨皮和泛滥雪山意象。

### 布局建议
首屏 70–85vh：左侧一句清晰 B2B 价值主张，右侧或背景为纤维/工艺强图；首屏下方放三项可信证据（产能、认证、交付市场）。第二屏四类产品卡；第三屏供应链流程；第四屏能力数据与证书；第五屏样卡申请表；末尾 FAQ、联系与全球区域。桌面端宽度 1200–1440px，移动端首屏 CTA 固定可见，表单不超过 6 个必填项。

### 改版优先级
- **P0**：重做首屏价值主张、摄影和 CTA；让访客 5 秒内知道“做什么、服务谁、如何索样”。
- **P0**：补齐可验证的产能/认证/流程/客户区域证据模块，解决 B2B 信任问题。
- **P1**：建设四类产品目录与筛选字段（成分、支数、克重、颜色、MOQ、交期）。
- **P1**：上线双路径询盘（样卡申请、定制生产）与轻量 CRM 表单，记录来源和需求。
- **P2**：补充品牌历史、可持续故事、案例和多语言 SEO；统一图片资产与设计 token。

## 7. 限制说明

Maysun Group、Natuzzi Furs、Cashmere of the UK、Inner Mongolia Cashmere、Tianli Cashmere 均因本次运行环境出现 `ERR_CONNECTION_CLOSED`，且 curl 对应域名 DNS 无法解析；Cashmere Works 可连接但被 Cloudflare 挡在安全验证页；Loro Piana 出现 `ERR_SSL_PROTOCOL_ERROR`/Windows Schannel TLS 错误。Scabal、Dormeuil、Holland & Sherry 成功实际打开并截图。由于失败站点没有可见首页，报告没有臆测其字体、配色或布局；Loro Piana 仅列为待补采对象。

**一句话总结：erdosdx.com 应该走“克制奢华、材料特写、工艺证据、目录清晰、询盘转化”五个关键词。**
