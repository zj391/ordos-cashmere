/**
 * LinkedIn company page channel (mock implementation).
 *
 * 2026-09-04 zj ask: 同步公司动态到 LinkedIn company page.
 * 真实 API: https://learn.microsoft.com/en-us/linkedin/marketing/
 *   → Marketing Developer Platform → ugcPosts API
 *   POST https://api.linkedin.com/rest/ugcPosts
 *   Headers: Authorization: Bearer {access_token},
 *            LinkedIn-Version: 202408,
 *            X-Restli-Protocol-Version: 2.0.0
 *   Body: { author: 'urn:li:organization:{id}',
 *           lifecycleState: 'PUBLISHED',
 *           specificContent: { 'com.linkedin.ugc.ShareContent': {
 *             shareCommentary: { text: '...' },
 *             shareMediaCategory: 'IMAGE',
 *             media: [ { status: 'READY', description: {...}, originalUrl: '...', title: '...' } ]
 *           } },
 *           visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' } }
 *
 * env: LINKEDIN_ACCESS_TOKEN, LINKEDIN_ORG_URN
 *  (marketing API: client_id/secret for OAuth refresh)
 *
 * For now, push() returns status='skipped' with a clear message
 * so the admin UI can show "LinkedIn: API not configured".
 * Replace push() body with the API call once env vars are set.
 */

import type { SyncChannel } from '../channel-base';
import type { ChannelContent, ChannelResult, ProductPayload } from '../types';

export class LinkedInChannel implements SyncChannel {
  readonly id = 'linkedin' as const;
  readonly label = 'LinkedIn';
  readonly isAutomated = true;

  format(product: ProductPayload): ChannelContent {
    // LinkedIn company post: lead with product identity, factual
    // specs, link back to the source page. Keep under 700 chars
    // (LinkedIn truncates around 210 for some surfaces, full text
    // shows in dedicated click-through view).
    const parts: string[] = [];
    parts.push(`New from DONGXIAO®: ${product.name}.`);
    if (product.material) parts.push(`Material: ${product.material}.`);
    if (product.micron) parts.push(`Fineness: ${product.micron}.`);
    parts.push(`Category: ${product.category}.`);
    parts.push('');
    parts.push(product.intro);
    parts.push('');
    parts.push('Project terms confirmed in writing.');
    parts.push(`Source: ${product.sourceUrl}`);

    return {
      title: product.name,
      body: parts.join('\n'),
      images: product.images.slice(0, 1), // LinkedIn: 1 image per post
      tags: ['B2B', 'Cashmere', 'Wholesale'],
      ctaUrl: product.sourceUrl,
    };
  }

  async push(_content: ChannelContent, product: ProductPayload): Promise<ChannelResult> {
    const env = (typeof process !== 'undefined' ? process.env : null) as NodeJS.ProcessEnv | null;
    const token = env?.LINKEDIN_ACCESS_TOKEN;
    const orgUrn = env?.LINKEDIN_ORG_URN;

    if (!token || !orgUrn) {
      return {
        channel: 'linkedin',
        status: 'skipped',
        errorMessage:
          'LinkedIn not configured. Set LINKEDIN_ACCESS_TOKEN and LINKEDIN_ORG_URN in Vercel env to enable automated posting.',
        pushedAt: Date.now(),
      };
    }

    // TODO(phase-2): real fetch to https://api.linkedin.com/rest/ugcPosts
    // Body shape is documented in the file header above.
    // The status='skipped' branch above is the current behaviour
    // when env vars are absent — replace with status='pushed' once
    // the real POST is wired up.
    return {
      channel: 'linkedin',
      status: 'skipped',
      errorMessage: `LinkedIn API client not yet implemented. Configured org=${orgUrn}, product=${product.id}.`,
      pushedAt: Date.now(),
    };
  }
}
