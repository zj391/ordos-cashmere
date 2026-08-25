/**
 * GET /api/admin/products/export.csv — full product catalog as CSV.
 *
 * Requires a valid admin_session cookie (signed token, see ../_session.js).
 * Rewritten to the Vercel default-export handler style (the previous
 * Astro-style `export const GET` returned BAD_CONTENT in production).
 *
 * Data source: src/data/products.json (the same catalog the storefront
 * builds from). Once the storefront reads products from Supabase, this
 * endpoint can switch to a DB query with the same column layout.
 */
import { verifySession, getSecret } from '../../admin/admin-session.js';
import productsJson from '../../../data/products.json';

function authed(req) {
  const cookie = String(req.headers.cookie || '');
  const m = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/);
  return verifySession(m ? m[1] : '', getSecret());
}

function csvCell(v) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default async function handler(req, res) {
  if (!authed(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

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
  for (const cat of productsJson.categories) {
    for (const p of cat.products) {
      rows.push(
        [
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
        ]
          .map(csvCell)
          .join(',')
      );
    }
  }

  // BOM so Excel/Sheets recognise UTF-8
  const csv = '\ufeff' + rows.join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(csv);
}
