/**
 * Sync orchestrator.
 *
 * syncOne(product, channelIds, triggeredBy) is the single
 * entry point used by both the admin UI (/api/sync) and
 * (future) cron jobs. Loads product from products.json, formats
 * per channel, calls push() concurrently, and records the
 * SyncLogEntry.
 *
 * The log is in-memory (Map) for Phase 1. Phase 2 will move to
 * a Supabase table once the DB write path is decided.
 */

import type {
  ChannelId,
  ChannelResult,
  ProductPayload,
  SyncLogEntry,
} from './types';
import { getChannel } from './registry';

const _log = new Map<string, SyncLogEntry>();
let _counter = 0;

function _newLogId(): string {
  _counter += 1;
  return `sl_${Date.now().toString(36)}_${_counter.toString(36)}`;
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
  const log: SyncLogEntry = {
    id: _newLogId(),
    productId: product.id,
    productName: product.name,
    channels: [],
    startedAt: Date.now(),
    triggeredBy,
  };

  const tasks = channelIds.map(async (cid) => {
    const channel = getChannel(cid);
    const content = channel.format(product);
    try {
      const result = await channel.push(content, product);
      log.channels.push(result);
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
