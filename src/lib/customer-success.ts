/**
 * Customer-success profile stored as a bounded summary in protected lead notes.
 * It coexists with the deal-workflow summary without requiring unverified schema changes.
 */
export const ACCOUNT_TIERS = ['strategic', 'active', 'nurture', 'paused'] as const;
export const SERVICE_CADENCES = ['weekly', 'monthly', 'quarterly'] as const;

export type AccountTier = typeof ACCOUNT_TIERS[number];
export type ServiceCadence = typeof SERVICE_CADENCES[number];

const blockPattern = (title: string) => new RegExp(`\\n?\\[${title.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\][\\s\\S]*?(?=\\n\\[[^\\n]+\\]|$)`, 'm');

export function isAccountTier(value: unknown): value is AccountTier {
  return typeof value === 'string' && (ACCOUNT_TIERS as readonly string[]).includes(value);
}

export function isServiceCadence(value: unknown): value is ServiceCadence {
  return typeof value === 'string' && (SERVICE_CADENCES as readonly string[]).includes(value);
}

export function isCustomerDate(value: unknown): value is string {
  return typeof value === 'string' && (/^\d{4}-\d{2}-\d{2}$/.test(value) || value === '');
}

export function stripCustomerSuccessSummary(notes: string | null | undefined): string {
  return String(notes || '').replace(blockPattern('Customer success'), '').trim();
}

export function readCustomerSuccess(notes: string | null | undefined): Record<string, string> {
  const match = String(notes || '').match(new RegExp(`\\[Customer success\\]([\\s\\S]*?)(?=\\n\\[[^\\n]+\\]|$)`, 'm'));
  return (match?.[1] || '').split('\n').reduce<Record<string, string>>((result, line) => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) result[key.trim()] = rest.join('=').trim();
    return result;
  }, {});
}

export function customerSuccessSummary(input: { account_tier?: string; service_cadence?: string; next_review_date?: string; catalog_version?: string; color_card_version?: string }): string {
  return [
    '[Customer success]',
    `tier=${input.account_tier || 'nurture'}`,
    `cadence=${input.service_cadence || 'quarterly'}`,
    `next_review=${input.next_review_date || 'not_set'}`,
    `catalog_version=${input.catalog_version || 'not_set'}`,
    `color_card_version=${input.color_card_version || 'not_set'}`,
    `updated_at=${new Date().toISOString()}`,
  ].join('\n');
}
