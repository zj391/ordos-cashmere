/**
 * GET /api/admin/products/export.csv
 *
 * Returns the entire product catalog as a downloadable CSV.
 * Subject to the same admin cookie gate as /admin/* (gate is set by middleware).
 *
 * Output: text/csv; charset=utf-8 with the standard `Content-Disposition: attachment` header.
 *
 * NOTE: filters via ?q= and ?cat= are accepted but currently ignored — always exports the
 * full catalog. Adding server-side filtering here would require the same request-scoped
 * import used by products.astro, which Vercel serverless + Astro 5 supports but isn't
 * strictly needed for an internal admin export.
 */
import { products as productsData } from '../../src/data/products.js';

function csvCell(v) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const GET = async ({ request }) => {
  const url = new URL(request.url);
  // Filters accepted but currently no-op — documented so callers can pass them.
  const _q = url.searchParams.get('q') || '';
  const _cat = url.searchParams.get('cat') || '';

  const headers = [
    'id',
    'category',
    'category_id',
    'name',
    'code',
    'price',
    'currency',
    'moq',
    'material',
    'micron',
    'colors',
    'images',
    'weight',
    'lead',
    'sample_time',
    'tags',
    'description',
  ];

  const rows = [headers.map(csvCell).join(',')];
  for (const cat of productsData.categories) {
    for (const p of cat.products) {
      rows.push([
        p.id,
        cat.name,
        cat.id,
        p.name,
        p.code || '',
        p.price,
        p.currency || 'USD',
        p.moq,
        p.material,
        p.micron,
        (p.colors || []).join('|'),
        (p.images || []).join('|'),
        p.weight,
        p.lead,
        p.sample_time,
        (p.tags || []).join('|'),
        p.description,
      ].map(csvCell).join(','));
    }
  }

  // BOM so Excel/Sheets recognise UTF-8
  const csv = '﻿' + rows.join('\r\n');

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="products.csv"',
      'Cache-Control': 'no-store',
    },
  });
};
