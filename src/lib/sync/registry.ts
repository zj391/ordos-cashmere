/**
 * Channel registry — instantiates the three platform adapters
 * with their required env vars (or 'skipped' status if missing).
 *
 * Singleton-style — caller does getChannel('linkedin') and gets
 * the same instance across requests (singleton is fine for this
 * scale; nothing stateful inside the channel).
 */

import type { ChannelId } from './types';
import type { SyncChannel } from './channel-base';
import { LinkedInChannel } from './channels/linkedin';
import { AlibabaChannel } from './channels/alibaba';
import { XiaohongshuChannel } from './channels/xiaohongshu';

const _channels: Record<ChannelId, SyncChannel> = {
  linkedin: new LinkedInChannel(),
  alibaba: new AlibabaChannel(),
  xiaohongshu: new XiaohongshuChannel(),
};

export function getChannel(id: ChannelId): SyncChannel {
  return _channels[id];
}

export function listChannels(): SyncChannel[] {
  return [_channels.linkedin, _channels.alibaba, _channels.xiaohongshu];
}
