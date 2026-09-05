/**
 * SyncChannel — interface every platform adapter must satisfy.
 *
 * The runner.ts orchestrator treats all channels uniformly:
 *
 *   for each product:
 *     const content = formatForChannel(channel, product)
 *     const result  = await channel.push(content)
 *
 * Adapter implementations live in ./channels/*.ts.
 */

import type {
  ChannelContent,
  ChannelId,
  ChannelResult,
  ProductPayload,
} from './types';

export interface SyncChannel {
  readonly id: ChannelId;
  readonly label: string;
  /**
   * True when this adapter can push automatically. False for
   * 'xiaohongshu' which has no official B2B API and is
   * generated as a manual template only.
   */
  readonly isAutomated: boolean;
  /**
   * Convert a normalized ProductPayload into channel-specific
   * content (title, body, tags, etc). Pure transform — no I/O.
   */
  format(product: ProductPayload): ChannelContent;
  /**
   * Send the rendered content to the platform. Returns a
   * ChannelResult describing success/failure.
   *
   * For manual channels (xiaohongshu) this is a no-op that
   * returns status='manual_ready' with a previewUrl pointing
   * at the in-browser copy-paste template.
   */
  push(content: ChannelContent, product: ProductPayload): Promise<ChannelResult>;
}
