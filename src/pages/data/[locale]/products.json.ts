/**
 * jevseo 2026-10-23 JEV-008: machine-readable catalog dataset.
 *
 * /[locale]/products/ used to inline this payload as a
 * <script type="application/json"> block, contributing 322 KB to a 635 KB
 * document (66% payload). It now ships only here, and the page's client JS
 * fetches it — the two <link rel="preload"> hints on the page mean the
 * browser normally has it in cache before the fetch fires, so there is no
 * extra round trip.
 *
 * The payload is produced by buildListingProducts(), the same helper the page
 * used before, so /data/<locale>/products.json and the former inline block are
 * byte-identical.
 *
 * scripts/extract-product-data-files.mjs used to generate this file by
 * scraping the inline block out of the prerendered HTML. That is no longer
 * possible now that the inline copy is gone, so the endpoint writes it during
 * the Astro build instead. The postbuild script is kept for the three small
 * datasets that are still inline.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { LOCALES, pickLocale } from '@/lib/i18n';
import { getAllProducts, ensureDbOverlay } from '@/data/products';
import { buildListingProducts } from '@/lib/catalog-listing-payload';

export const prerender = true;

export const getStaticPaths = (() =>
  LOCALES.map((locale) => ({ params: { locale } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const locale = pickLocale(params.locale);
  await ensureDbOverlay();

  const payload = buildListingProducts(getAllProducts());

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // must-revalidate so a new deployment's catalog is picked up on the
      // next request rather than being served stale from the CDN.
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};