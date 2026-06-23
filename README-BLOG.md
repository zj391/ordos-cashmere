# GEO SEO Blog System

每日自动生成多语言 GEO SEO 博客，覆盖 6 个语种（en/cn/de/fr/ja/kr）。由 LLM 生成英文原稿 → 自动翻译 5 个其他语言 → 写入 Astro Content Collections。

## 文件结构

```
src/content/blog/
├── en/  cn/  de/  fr/  ja/  kr/
│   └── {slug}.md       # 每篇博客 6 个语言版本（同一 slug）

scripts/
└── generate-blog.mjs   # LLM 生成器（手动触发）

.github/workflows/
└── blog.yml            # 每天 UTC 02:00 自动跑
```

## Frontmatter 字段

```yaml
---
title: "..."
excerpt: "..."
publishDate: "2026-05-20"
author: "DONGXIAO Cashmere Editorial"
tags: ["tag1", "tag2"]
geoRegion: "GLOBAL|EU|JP|KR|CN-15|NA"
targetKeywords: ["keyword 1", "keyword 2"]
relatedProducts: ["raw_material", "yarn_fabric", "garment_oem"]
aiGenerated: true|false
sourceTopic: "manual" | "<topic string>"
language: "en|cn|de|fr|ja|kr"
---
```

## 手动运行（测试）

```bash
# 需要 LLM key（任意 OpenAI 兼容）
export LLM_API_URL=https://openrouter.ai/api/v1/chat/completions
export LLM_API_KEY=*** export LLM_MODEL=anthropic/claude-3.5-sonnet

# 可选：覆盖默认主题/关键词
export TOPIC="How to negotiate FOB cashmere pricing"
export KEYWORDS="fob cashmere,negotiation tips,incoterms"

node scripts/generate-blog.mjs
```

输出 6 个 markdown 文件到 `src/content/blog/{locale}/` + 自动 commit 提示。

## GitHub Actions 自动化

### 一次性配置 secrets

在 GitHub repo → Settings → Secrets and variables → Actions → New repository secret：

| Secret | 用途 |
|--------|------|
| `LLM_API_URL` | chat completions 端点（如 `https://openrouter.ai/api/v1/chat/completions`） |
| `LLM_API_KEY` | API key |
| `LLM_MODEL` | 模型名（如 `anthropic/claude-3.5-sonnet`、`deepseek-chat`、`openrouter/free`） |
| `SITE_DOMAIN` | 站点域名（如 `erdosdx.com`） |
| `SITE_NAME` | 站点品牌名（如 `DONGXIAO Cashmere`） |

### 触发方式

- 自动：每天 UTC 02:00（北京时间 10:00）跑一次
- 手动：GitHub → Actions → Daily GEO Blog → Run workflow（可选输入 topic/keywords）

### 工作流步骤

1. 检出代码
2. 安装依赖
3. 跑 `generate-blog.mjs`（读 secrets 调 LLM）
4. 跑 `astro build` 验证
5. 检查 `src/content/blog/` 是否有变化
6. 有变化 → 自动 commit + push → 触发 Vercel 部署
7. 无变化 → 跳过（避免空 commit）

## 自定义生成主题

改 `scripts/generate-blog.mjs` 里的两个默认值：

```js
const TOPIC = envGet('TOPIC', '<默认主题>');
const KEYWORDS = envGet('KEYWORDS', '<默认关键词列表>');
```

或者在 workflow_dispatch 触发时手动输入。

## 多语种翻译保证

- frontmatter 字段名（`title`/`slug` 等）**不翻译** — 这是代码契约
- `slug` 全语种保持英文 kebab-case — URL 路径稳定
- `relatedProducts` 全语种保持英文代码 — API/UI 用的
- `geoRegion` 保持英文代码 — 后续可做地域路由
- 数字、专有名词（Ordos/Inner Mongolia/认证名）不翻译

## 添加手写博客（不走 AI）

直接创建 markdown 文件到 `src/content/blog/{locale}/{slug}.md`，frontmatter 设 `aiGenerated: false`、`sourceTopic: "manual"` 即可。

## 限制

- GitHub Actions 免费额度：2000 分钟/月。generate-blog 大约 1-2 分钟/天。
- LLM 成本：取决于模型。`openrouter/free` 免费但质量差；`anthropic/claude-3.5-sonnet` ~$0.01/篇 + 翻译 ×5。
- 若 LLM JSON 输出格式坏，整个流程会失败（脚本严格校验）。
