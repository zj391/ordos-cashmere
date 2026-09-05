/**
 * POST /api/sync
 *
 * Body: { productIds: string[], channels: ('linkedin'|'alibaba'|'xiaohongshu')[], triggeredBy?: string }
 *   OR { productId: string, channels: [...], triggeredBy? }   // single product
 *
 * Response: { results: [{ productId, perChannel: { linkedin: ChannelResult, ... }, logId }] }
 *
 * Phase 1: in-memory log + mock channels.
 * Phase 2: Supabase log + real LinkedIn/1688 calls.
 *
 * Auth: for now, open to admin route. Real authz will come when
 * we wire the admin UI login session to the API cookie.
 */

import type { APIRoute } from 'astro';
import type { ChannelId, ProductPayload } from '../../lib/sync/types';
import { findProduct, toPayload } from '../../lib/sync/loader';
import { syncOne, recentLogs } from '../../lib/sync/runner';

export const prerender = false;

const VALID_CHANNELS: ChannelId[] = ['linkedin', 'alibaba', 'xiaohongshu'];

function badRequest(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Body must be JSON');
  }
  if (!body || typeof body !== 'object') return badRequest('Invalid body');

  const b = body as Record<string, unknown>;
  const productIds: string[] = Array.isArray(b.productIds)
    ? b.productIds.filter((x): x is string => typeof x === 'string')
    : typeof b.productId === 'string'
    ? [b.productId]
    : [];
  const channels: ChannelId[] = Array.isArray(b.channels)
    ? b.channels.filter((c): c is ChannelId => VALID_CHANNELS.includes(c as ChannelId))
    : [];
  const triggeredBy = typeof b.triggeredBy === 'string' ? b.triggeredBy : 'api:unknown';
  const locale = typeof b.locale === 'string' ? b.locale : 'en';

  if (productIds.length === 0) return badRequest('productIds or productId required');
  if (channels.length === 0) return badRequest('channels must be a non-empty array of linkedin/alibaba/xiaohongshu');
  if (productIds.length > 50) return badRequest('Max 50 products per request (Phase 1 limit)');

  const results: Array<{ productId: string; productName: string; logId: string; perChannel: Record<string, unknown> }> = [];

  for (const pid of productIds) {
    const raw = findProduct(pid);
    if (!raw) {
      results.push({
        productId: pid,
        productName: '(not found)',
        logId: '',
        perChannel: { error: { status: 'error', errorMessage: `Product ${pid} not found` } },
      });
      continue;
    }
    const payload: ProductPayload = toPayload(raw, locale);
    const { log, perChannel } = await syncOne(payload, channels, triggeredBy);
    results.push({
      productId: pid,
      productName: payload.name,
      logId: log.id,
      perChannel: perChannel as Record<string, unknown>,
    });
  }

  return new Response(JSON.stringify({ results }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

/** GET /api/sync — recent log entries (debug / admin view). */
export const GET: APIRoute = async () => {
  const logs = recentLogs(50);
  return new Response(JSON.stringify({ logs }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
