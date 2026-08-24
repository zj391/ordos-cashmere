/**
 * B2B deal workflow: a schema-stable summary stored with linked lead notes.
 * This avoids adding unverified database columns while keeping a clear audit trail.
 */
export const DEAL_STAGES = ['inquiry_review', 'quote_drafting', 'quote_sent', 'sample_requested', 'sample_in_progress', 'sample_sent', 'negotiation', 'won', 'lost'] as const;
export const QUOTE_STATUSES = ['not_started', 'draft', 'sent', 'revised', 'accepted', 'declined'] as const;
export const SAMPLE_STATUSES = ['not_requested', 'requested', 'in_production', 'sent', 'approved', 'revision_needed'] as const;

export type DealStage = typeof DEAL_STAGES[number];
export type QuoteStatus = typeof QUOTE_STATUSES[number];
export type SampleStatus = typeof SAMPLE_STATUSES[number];

export interface DealWorkflowInput {
  deal_stage?: string;
  quote_status?: string;
  sample_status?: string;
  next_action_date?: string;
}

export function isDealStage(value: unknown): value is DealStage {
  return typeof value === 'string' && (DEAL_STAGES as readonly string[]).includes(value);
}

export function isQuoteStatus(value: unknown): value is QuoteStatus {
  return typeof value === 'string' && (QUOTE_STATUSES as readonly string[]).includes(value);
}

export function isSampleStatus(value: unknown): value is SampleStatus {
  return typeof value === 'string' && (SAMPLE_STATUSES as readonly string[]).includes(value);
}

export function isActionDate(value: unknown): value is string {
  return typeof value === 'string' && (/^\d{4}-\d{2}-\d{2}$/.test(value) || value === '');
}

export function hasWorkflowInput(value: DealWorkflowInput): boolean {
  return Boolean(value.deal_stage || value.quote_status || value.sample_status || value.next_action_date);
}

export function stripWorkflowSummary(notes: string | null | undefined): string {
  return String(notes || '').replace(/\n?\[Deal workflow\][\s\S]*$/m, '').trim();
}

export function workflowSummary(value: DealWorkflowInput): string {
  const lines = [
    '[Deal workflow]',
    `stage=${value.deal_stage || 'inquiry_review'}`,
    `quote=${value.quote_status || 'not_started'}`,
    `sample=${value.sample_status || 'not_requested'}`,
    `next_action=${value.next_action_date || 'not_set'}`,
    `updated_at=${new Date().toISOString()}`,
  ];
  return lines.join('\n');
}

export function readWorkflow(notes: string | null | undefined): Record<string, string> {
  const block = String(notes || '').match(/\[Deal workflow\]([\s\S]*)$/m)?.[1] || '';
  return block.split('\n').reduce<Record<string, string>>((result, line) => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) result[key.trim()] = rest.join('=').trim();
    return result;
  }, {});
}
