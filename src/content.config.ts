import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog 集合 - GEO SEO 博客
 * 路径结构: src/content/blog/{locale}/{slug}.md
 * locale: en | cn | de | fr | ja | kr
 *
 * 由 scripts/generate-blog.mjs + GitHub Actions 每日自动生成
 * Astro Content Collections 自动提供 getCollection() API
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('DONGXIAO® Editorial'),
    tags: z.array(z.string()).default([]),
    // GEO 字段 - 自动填充到页面和 schema
    geoRegion: z.string().optional(),         // 'CN-15' / 'EU' / 'JP' / 'KR' / 'NA' / 'GLOBAL'
    targetKeywords: z.array(z.string()).default([]),  // ['Europe cashmere supplier', 'Ordos cashmere manufacturer']
    relatedProducts: z.array(z.enum(['raw_material', 'yarn_fabric', 'garment_oem'])).default([]),
    // AI 生成元信息
    aiGenerated: z.boolean().default(false),
    sourceTopic: z.string().optional(),
  }),
});

export const collections = { blog };
