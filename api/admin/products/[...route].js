/**
 * Vercel Hobby compatibility dispatcher for product administration endpoints.
 * Preserves /api/admin/products/new, /export.csv and /:id while deploying one function.
 */
import productById from '../../../src/server/api/admin-products/[id].js';
import productExport from '../../../src/server/api/admin-products/export.csv.js';
import productNew from '../../../src/server/api/admin-products/new.js';

export default async function handler(req, res) {
  const raw = req.query && req.query.route;
  const route = Array.isArray(raw) ? raw.join('/') : String(raw || '');
  if (route === 'new') return productNew(req, res);
  if (route === 'export.csv') return productExport(req, res);
  if (!route || route.includes('/')) return res.status(404).json({ error: 'product_api_route_not_found' });
  req.query = { ...(req.query || {}), id: route };
  return productById(req, res);
}
