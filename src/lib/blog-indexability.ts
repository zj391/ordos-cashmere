/**
 * 仅将已完成独立资料核验与引用审阅的博客文章作为可索引知识内容。
 * 其他历史文章继续保留原 URL，供已有访问者和业务内部审阅使用，但不会
 * 被 sitemap、Article Schema 或博客枢纽作为搜索入口放大。
 */
export const INDEXABLE_BLOG_IDS = new Set([
  'en/cashmere-test-report-checklist-b2b-buyers',
]);

export function getBlogSlugFromId(id: string) {
  const [, ...segments] = id.replace(/\.md$/, '').split('/');
  return segments.join('/');
}

export function isIndexableBlogPost(locale: string, slug: string) {
  return INDEXABLE_BLOG_IDS.has(`${locale}/${slug}`);
}
