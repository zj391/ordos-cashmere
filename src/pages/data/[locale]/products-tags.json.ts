/**
 * jevseo 2026-10-23 JEV-008: machine-readable tag index for the catalog.
 *
 * The second of the two large inline JSON blocks removed from
 * /[locale]/products/ — 86 KB of `{ productId: ["byStyle=beanies", …] }` used
 * by the listing's client-side filter to respond to mega-menu URL params like
 * ?byStyle=beanies without a round trip to the server.
 *
 * Built by buildListingTagsIndex(), the same helper the page used, so this
 * file is byte-identical to the block it replaces.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { LOCALES, pickLocale } from '@/lib/i18n';
import { getAllProducts, ensureDbOverlay } from '@/data/products';
import { buildListingTagsIndex } from '@/lib/catalog-listing-payload';

export const prerender = true;

export const getStaticPaths = (() =>
  LOCALES.map((locale) => ({ params: { locale } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const locale = pickLocale(params.locale);
  await ensureDbOverlay();

  const payload = buildListingTagsIndex(getAllProducts());

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};