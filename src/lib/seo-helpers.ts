/**
 * SEO 辅助：根据 pageKey 取出对应语种的 SEO 配置
 */
import type { LocaleSEO, PageSEO } from './seo';

export type PageKey =
  | 'home'
  | 'rawMaterial'
  | 'yarnFabric'
  | 'garmentOem'
  | 'factory'
  | 'ordosOrigin'
  | 'contact'
  | 'blog'
  | 'download'
  | 'faq'
  | 'privacy';

export function getPageSEO(seo: LocaleSEO, key: PageKey): PageSEO {
  return seo[key];
}
