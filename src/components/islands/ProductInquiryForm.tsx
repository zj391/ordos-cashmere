/**
 * 三套独立询盘表单共享基础（产品页专用）
 * 不含 type 切换（按定稿要求"禁止合并"）
 * 三个产品页用不同的 endpoint + 不同的字段配置
 */
import { useState } from 'react';

interface FieldDef {
  name: string;
  label: Record<string, string>;
  type?: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  required?: boolean;
  options?: Record<string, Record<string, string>>;
  placeholder?: Record<string, string>;
  fullWidth?: boolean;
}

interface Props {
  locale: string;
  endpoint: string;            // /api/inquiry/raw etc.
  productType: 'raw' | 'yarn' | 'garment';
  title: Record<string, string>;
  submitLabel: Record<string, string>;
  submittingLabel: Record<string, string>;
  successMsg: Record<string, string>;
  errorMsg: Record<string, string>;
  fields: FieldDef[];
}

export default function ProductInquiryForm({
  locale,
  endpoint,
  productType,
  title,
  submitLabel,
  submittingLabel,
  successMsg,
  errorMsg,
  fields,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const L = (m: Record<string, string>) => m[locale] || m.en || '';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus('idle');
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locale, type: productType }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      (e.target as HTMLFormElement).reset();

      // GA4 提交事件（按产品类型分流）
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'inquiry_submit', {
          event_category: 'b2b_lead',
          event_label: productType,
          locale,
          inquiry_type: productType,
        });
      }
      // 后台 track（独立于 GA4，走 /api/track-event）
      fetch('/api/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: 'inquiry_submit',
          product_type: productType,
          locale,
        }),
      }).catch(() => {});
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-8">
      <h2 className="font-display text-2xl md:text-3xl font-light mb-6">{L(title)}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.name} className={f.fullWidth ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium mb-2">{L(f.label)}</label>
            {f.type === 'textarea' ? (
              <textarea
                name={f.name}
                required={f.required}
                rows={5}
                className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : f.type === 'select' && f.options ? (
              <select
                name={f.name}
                required={f.required}
                className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                {Object.entries(f.options).map(([k, labels]) => (
                  <option key={k} value={k}>
                    {labels[locale] || labels.en || k}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type || 'text'}
                name={f.name}
                required={f.required}
                placeholder={f.placeholder ? L(f.placeholder) : undefined}
                className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? L(submittingLabel) : L(submitLabel)}
      </button>

      {status === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">
          {L(successMsg)}
        </div>
      )}
      {status === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
          {L(errorMsg)}
        </div>
      )}
    </form>
  );
}
