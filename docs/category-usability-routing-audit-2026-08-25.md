# 产品分类页视觉对比与路由可用性修复

## 问题与根因

配饰分类页的首屏依赖 `bg-brand-ink text-white` 工具类。截图显示在实际页面主题或缓存样式组合下，分类首屏落入浅色背景，而说明和项目符号仍继承白色前景，导致文字不可读。为避免主题或样式缓存再次改变这一组合，本轮将分类首屏定义为独立的深色背景组件，并对标题、说明、列表和项目符号施加明确前景色保护。

同时，真正的分类枢纽使用历史 slugs：帽子为 `hats-accessories`、羊绒衫为 `garment-oem`、配饰为 `accessories-cat`。直接访问更直觉的 `/products/hats/`、`/products/sweaters/`、`/products/accessories/` 会与产品详情动态路由发生冲突并返回 404。

## 实施

分类首屏现在固定为深墨色 `#1C1813`，正文为乳白色 `#F7F3EC`，项目符号为金色 `#D8B787`。主导航的五个分类标签均改为指向实际分类枢纽；下拉菜单的细分筛选仍保留原有 `/products/?cat=...` 查询链接。

新增三组永久重定向兼容路径：`hats → hats-accessories`、`sweaters → garment-oem`、`accessories → accessories-cat`。每组六种语言共 18 个静态重定向页面均为 `noindex`，不进入 sitemap；这样保留既有访问链接并将索引信号集中在分类枢纽 canonical URL，不创建重复可索引内容。

## 验证

完整 Astro/Vercel 构建成功。六语 18 个兼容路径均生成静态重定向与 `noindex`，五个主分类导航入口均存在，抽样分类枢纽均有单一 canonical，兼容 URL 在 sitemap 中数量为零。构建后的分类首屏 HTML 均包含深色背景、乳白色前景和金色项目符号保护标记。产品 sitemap 仍为 3,522 个 URL，根级 API 入口仍为五个。
