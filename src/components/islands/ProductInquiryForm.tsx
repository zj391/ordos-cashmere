/**
 * 三套独立询盘表单共享基础（产品页专用）
 * 不含 type 切换（按定稿要求"禁止合并"）
 * 三个产品页用不同的 endpoint + 不同的字段配置
 *
 * 7-8 增强：支持 file 附件（base64 内联）+ date 日期 + honeypot 防 bot
 */
import { useState } from 'react';

interface FieldDef {
  name: string;
  label: Record<string, string>;
  type?: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'date' | 'file';
  required?: boolean;
  options?: Record<string, Record<string, string>>;
  placeholder?: Record<string, string>;
  fullWidth?: boolean;
  /** accepted file types for type='file' (defaults to images+PDF) */
  accept?: string;
  /** max file size in MB (defaults to 2) */
  maxMb?: number;
  /** for type='file': allow multiple files. Defaults to true. */
  multiple?: boolean;
}

interface Props {
  locale: string;
  endpoint: string;            // /api/inquiry (handler discriminates on type field)
  productType: 'raw' | 'yarn' | 'garment';
  title: Record<string, string>;
  submitLabel: Record<string, string>;
  submittingLabel: Record<string, string>;
  successMsg: Record<string, string>;
  errorMsg: Record<string, string>;
  fields: FieldDef[];
  /** when true, accept file attachments (shows upload UI + honeypot) */
  enableAttachments?: boolean;
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
  enableAttachments = false,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [attachments, setAttachments] = useState<Array<{ name: string; type: string; dataUrl: string }>>([]);
  const [attachError, setAttachError] = useState<string>('');

  const L = (m: Record<string, string>) => m[locale] || m.en || '';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus('idle');
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    // Honeypot: if filled, it's a bot. Silently fail with 'success' so bots
    // don't retry. Real users never see the field (CSS-hidden).
    if (data.website) {
      setStatus('success');
      setSubmitting(false);
      return;
    }
    // Attachments to JSON payload (base64 inline)
    const payload: Record<string, unknown> = { ...data, locale, type: productType };
    if (enableAttachments && attachments.length > 0) {
      payload.attachments = attachments;
    }
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      (e.target as HTMLFormElement).reset();
      setAttachments([]);

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

  // Convert a File to {name,type,dataUrl} (base64). Reject if too large.
  function readFile(file: File, maxMb: number): Promise<{ name: string; type: string; dataUrl: string }> {
    return new Promise((resolve, reject) => {
      if (file.size > maxMb * 1024 * 1024) {
        return reject(new Error(`File "${file.name}" exceeds ${maxMb}MB limit`));
      }
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: reader.result as string });
      reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, maxMb: number) {
    setAttachError('');
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (attachments.length + files.length > 3) {
      setAttachError('Max 3 attachments');
      return;
    }
    try {
      const newOnes = await Promise.all(files.map((f) => readFile(f, maxMb)));
      setAttachments((cur) => [...cur, ...newOnes]);
    } catch (e: any) {
      setAttachError(e?.message || 'Upload failed');
    }
  }

  const attachLabel = {
    en: 'Attachments (optional, max 3 files, 2MB each)',
    cn: '附件（可选，最多 3 个文件，每个 2MB）',
    de: 'Anhänge (optional, max. 3 Dateien, je 2MB)',
    fr: 'Pièces jointes (optionnel, max 3 fichiers, 2Mo chacun)',
    ja: '添付ファイル（任意、最大3ファイル、各2MB）',
    kr: '첨부파일 (선택, 최대 3개, 각 2MB)',
  };
  const honeypotLabel = { en: 'Website', cn: '网站', de: 'Webseite', fr: 'Site web', ja: 'ウェブサイト', kr: '웹사이트' };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-8">
      <h2 className="font-display text-2xl md:text-3xl font-light mb-6">{L(title)}</h2>

      {/* Honeypot: hidden from real users via CSS + tabindex=-1, but bots auto-fill */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website-hp">{L(honeypotLabel)}</label>
        <input id="website-hp" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

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
            ) : f.type === 'date' ? (
              <input
                type="date"
                name={f.name}
                required={f.required}
                className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : f.type === 'file' ? (
              <input
                type="file"
                name={f.name}
                accept={f.accept || 'image/*,application/pdf'}
                multiple
                onChange={(e) => handleFileChange(e, f.maxMb || 2)}
                className="w-full text-sm file:mr-3 file:px-3 file:py-2 file:border-0 file:rounded file:bg-secondary file:text-foreground hover:file:bg-secondary/80"
              />
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

      {/* Attachments preview (when enabled) */}
      {enableAttachments && attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{attachments.length} file(s) ready to upload</p>
          <ul className="text-xs space-y-1">
            {attachments.map((a, i) => (
              <li key={i} className="flex items-center justify-between bg-secondary/30 rounded px-3 py-1.5">
                <span className="truncate">{a.name} <span className="text-muted-foreground">({a.type || 'file'})</span></span>
                <button
                  type="button"
                  onClick={() => setAttachments((cur) => cur.filter((_, j) => j !== i))}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {enableAttachments && attachError && (
        <p className="text-xs text-red-600">{attachError}</p>
      )}
      {enableAttachments && (
        <p className="text-xs text-muted-foreground">{L(attachLabel)}</p>
      )}

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
