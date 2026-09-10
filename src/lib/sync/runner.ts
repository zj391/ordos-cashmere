/**
 * Sync orchestrator.
 *
 * syncOne(product, channelIds, triggeredBy) is the single
 * entry point used by both the admin UI (/api/sync) and
 * (future) cron jobs. Loads product from products.json, formats
 * per channel, calls push() concurrently, and records the
 * SyncLogEntry.
 *
 * 阶段 1.5 (2026-09-10): SyncLogEntry 现在双写 — 内存 Map (快速缓存
 * 给 admin UI recentLogs) + Supabase sync_logs 表 (持久化给 weekly-report)。
 * DB 写入是 fire-and-forget，失败不阻塞 push 主流程。
 *
 * 设计权衡：
 * - DB 写在 try/catch 里静默失败 — sync 推送本身比日志重要
 * - 每行 = 一次单 channel push，不是 1 run = 1 行（聚合更直接）
 * - 如果 Supabase 没配置（SUPABASE_URL 缺失）则跳过 DB 写入
 */

import type {
  ChannelId,
  ChannelResult,
  ProductPayload,
  SyncLogEntry,
} from './types';
import { getChannel } from './registry';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const HAS_SUPABASE = !!(SUPABASE_URL && SUPABASE_KEY);

const _log = new Map<string, SyncLogEntry>();
let _counter = 0;

function _newLogId(): string {
  _counter += 1;
  return `sl_${Date.now().toString(36)}_${_counter.toString(36)}`;
}

/**
 * Fire-and-forget Supabase insert.
 * Failure logged to console, never throws — sync push must not be blocked by log writes.
 */
function _persistChannelResult(
  runId: string,
  product: ProductPayload,
  result: ChannelResult,
  triggeredBy: string,
  startedAt: number,
): void {
  if (!HAS_SUPABASE) return;
  const row = {
    run_id: runId,
    product_id: product.id,
    product_name: product.name,
    channel: result.channel,
    status: result.status,
    external_id: result.externalId || null,
    external_url: result.externalUrl || null,
    preview_url: result.previewUrl || null,
    error_message: result.errorMessage || null,
    triggered_by: triggeredBy,
    started_at: startedAt,
    finished_at: Date.now(),
    pushed_at: result.pushedAt || null,
  };
  fetch(`${SUPABASE_URL}/rest/v1/sync_logs`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(row),
  }).catch((err) => {
    console.error('[sync_runner] persist failed (non-blocking):', err?.message || err);
  });
}

interface RunResult {
  log: SyncLogEntry;
  perChannel: Record<ChannelId, ChannelResult>;
}

export async function syncOne(
  product: ProductPayload,
  channelIds: ChannelId[],
  triggeredBy: string,
): Promise<RunResult> {
  const runStartedAt = Date.now();
  const log: SyncLogEntry = {
    id: _newLogId(),
    productId: product.id,
    productName: product.name,
    channels: [],
    startedAt: runStartedAt,
    triggeredBy,
  };

  const tasks = channelIds.map(async (cid) => {
    const channel = getChannel(cid);
    const content = channel.format(product);
    try {
      const result = await channel.push(content, product);
      log.channels.push(result);
      _persistChannelResult(log.id, product, result, triggeredBy, runStartedAt);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const failure: ChannelResult = {
        channel: cid,
        status: 'error',
        errorMessage: msg,
        pushedAt: Date.now(),
      };
      log.channels.push(failure);
      _persistChannelResult(log.id, product, failure, triggeredBy, runStartedAt);
      return failure;
    }
  });

  const results = await Promise.all(tasks);
  log.finishedAt = Date.now();
  _log.set(log.id, log);

  const perChannel = {} as Record<ChannelId, ChannelResult>;
  for (const r of results) perChannel[r.channel] = r;
  return { log, perChannel };
}

export function getLog(id: string): SyncLogEntry | undefined {
  return _log.get(id);
}

export function recentLogs(limit = 30): SyncLogEntry[] {
  return Array.from(_log.values())
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, limit);
}
