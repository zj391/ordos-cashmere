/**
 * 询盘表单 React Island
 * 支持 3 种询盘类型：原料 / 纱线面料 / 成衣代工
 *
 * 7-8 增强：附件上传（base64 内联）+ 期望交期 + honeypot 防 bot
 */
import { useState } from 'react';
import { COUNTRIES, LOCALE_TO_FIELD } from '@/data/countries';

interface Props {
  locale: string;
}

const labels: Record<string, Record<string, string>> = {
  en: {
    typeLabel: 'Inquiry Type',
    typeRaw: 'Raw Material',
    typeYarn: 'Yarn & Fabric',
    typeGarment: 'Garment OEM',
    name: 'Your Name *',
    company: 'Company *',
    country: 'Country *',
    email: 'Email *',
    phone: 'Phone / WhatsApp',
    quantity: 'Estimated Quantity',
    quantityHelp: 'e.g., 500kg / 5000m / 1000pcs',
    delivery_date: 'Required Delivery Date',
    attachments: 'Attachments (optional)',
    attachHint: 'Images or PDF, max 3 files, 2MB each',
    message: 'Message',
    submit: 'Submit Inquiry',
    submitting: 'Submitting...',
    success: 'Thank you! We will contact you within 24 hours.',
    error: 'Something went wrong. Please try again or contact us via WhatsApp.',
  },
  cn: {
    typeLabel: '询盘类型', typeRaw: '羊绒原料', typeYarn: '纱线/面料', typeGarment: '成衣代工',
    name: '姓名 *', company: '公司 *', country: '国家 *', email: '邮箱 *', phone: '电话/微信',
    quantity: '预计数量', quantityHelp: '如：500kg / 5000m / 1000件',
    delivery_date: '期望交货日期',
    attachments: '附件（可选）',
    attachHint: '图片或 PDF，最多 3 个，每个 2MB',
    message: '留言',
    submit: '提交询盘', submitting: '提交中...', success: '感谢！我们将在24小时内联系您。',
    error: '提交失败，请重试或通过微信联系我们。',
  },
  de: {
    typeLabel: 'Anfrage-Typ', typeRaw: 'Rohmaterial', typeYarn: 'Garn & Stoff', typeGarment: 'Bekleidung OEM',
    name: 'Name *', company: 'Firma *', country: 'Land *', email: 'E-Mail *', phone: 'Telefon',
    quantity: 'Geschätzte Menge', quantityHelp: 'z.B. 500kg / 5000m / 1000 Stk.',
    delivery_date: 'Wunschliefertermin',
    attachments: 'Anhänge (optional)',
    attachHint: 'Bilder oder PDF, max. 3 Dateien, je 2MB',
    message: 'Nachricht',
    submit: 'Anfrage senden', submitting: 'Wird gesendet...', success: 'Danke! Wir melden uns innerhalb von 24 Stunden.',
    error: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
  },
  fr: {
    typeLabel: 'Type', typeRaw: 'Matière', typeYarn: 'Fil & Tissu', typeGarment: 'Vêtement OEM',
    name: 'Nom *', company: 'Société *', country: 'Pays *', email: 'Email *', phone: 'Téléphone',
    quantity: 'Quantité estimée', quantityHelp: 'ex: 500kg / 5000m / 1000 pcs',
    delivery_date: 'Date de livraison souhaitée',
    attachments: 'Pièces jointes (optionnel)',
    attachHint: 'Images ou PDF, max 3 fichiers, 2Mo chacun',
    message: 'Message',
    submit: 'Envoyer', submitting: 'Envoi...', success: 'Merci! Nous vous contacterons sous 24h.',
    error: 'Erreur. Veuillez réessayer.',
  },
  ja: {
    typeLabel: '問い合わせ種別', typeRaw: '原料', typeYarn: '糸・生地', typeGarment: '衣料OEM',
    name: 'お名前 *', company: '会社 *', country: '国 *', email: 'メール *', phone: '電話',
    quantity: '数量目安', quantityHelp: '例: 500kg / 5000m / 1000枚',
    delivery_date: '希望納期',
    attachments: '添付ファイル（任意）',
    attachHint: '画像または PDF、最大 3 ファイル、各 2MB',
    message: 'メッセージ',
    submit: '送信', submitting: '送信中...', success: 'ありがとうございます！24時間以内にご連絡いたします。',
    error: 'エラーが発生しました。再試行してください。',
  },
  kr: {
    typeLabel: '문의 유형', typeRaw: '원료', typeYarn: '원사·직물', typeGarment: '의류 OEM',
    name: '이름 *', company: '회사 *', country: '국가 *', email: '이메일 *', phone: '전화',
    quantity: '예상 수량', quantityHelp: '예: 500kg / 5000m / 1000pcs',
    delivery_date: '희망 납기일',
    attachments: '첨부파일 (선택)',
    attachHint: '이미지 또는 PDF, 최대 3개, 각 2MB',
    message: '메시지',
    submit: '문의 보내기', submitting: '보내는 중...', success: '감사합니다! 24시간 이내에 연락드리겠습니다.',
    error: '오류가 발생했습니다. 다시 시도해 주세요.',
  },
};

const L = (locale: string, k: string) => labels[locale]?.[k] || labels.en[k] || k;

export default function ContactForm({ locale }: Props) {
  const [type, setType] = useState<'raw' | 'yarn' | 'garment'>('raw');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [attachments, setAttachments] = useState<Array<{ name: string; type: string; dataUrl: string }>>([]);
  const [attachError, setAttachError] = useState<string>('');

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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAttachError('');
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (attachments.length + files.length > 3) {
      setAttachError('Max 3 attachments');
      return;
    }
    try {
      const newOnes = await Promise.all(files.map((f) => readFile(f, 2)));
      setAttachments((cur) => [...cur, ...newOnes]);
    } catch (e: any) {
      setAttachError(e?.message || 'Upload failed');
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus('idle');
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    // Honeypot check
    if (data.website) {
      setStatus('success');
      setSubmitting(false);
      return;
    }
    data.type = type;
    const payload: any = { ...data, locale, type };
    if (attachments.length > 0) payload.attachments = attachments;
    try {
      const endpoint = '/api/inquiry';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      (e.target as HTMLFormElement).reset();
      setAttachments([]);

      // GA4 提交事件（通用 contact 表单，按 type 分流）
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'contact_submit', {
          event_category: 'b2b_lead',
          event_label: type,
          locale,
          inquiry_type: type,
        });
      }
      // 后台 track
      fetch('/api/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: 'contact_submit',
          inquiry_type: type,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website-hp">Website</label>
        <input id="website-hp" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">{L(locale, 'typeLabel')}</label>
        <div className="grid grid-cols-3 gap-3">
          {(['raw', 'yarn', 'garment'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-4 py-3 border rounded-md text-sm font-medium transition-colors ${
                type === t ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'
              }`}
            >
              {L(locale, `type${t.charAt(0).toUpperCase() + t.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{L(locale, 'name')}</label>
          <input type="text" name="name" required className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{L(locale, 'company')}</label>
          <input type="text" name="company" required className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{L(locale, 'country')}</label>
          <select name="country" required defaultValue="" className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white">
            <option value="" disabled>—</option>
            {COUNTRIES.map((c) => {
              const field = LOCALE_TO_FIELD[locale] || 'name_en';
              const label = c[field] || c.name_en;
              return <option key={c.code} value={c.code}>{label}</option>;
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{L(locale, 'email')}</label>
          <input type="email" name="email" required className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">{L(locale, 'phone')}</label>
          <input type="tel" name="phone" className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{L(locale, 'delivery_date')}</label>
          <input type="date" name="delivery_date" className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{L(locale, 'quantity')}</label>
          <input type="text" name="quantity" placeholder={L(locale, 'quantityHelp')} className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">{L(locale, 'message')}</label>
          <textarea name="message" rows={5} className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">{L(locale, 'attachments')}</label>
          <input
            type="file"
            name="attachments"
            accept="image/*,application/pdf"
            multiple
            onChange={handleFileChange}
            className="w-full text-sm file:mr-3 file:px-3 file:py-2 file:border-0 file:rounded file:bg-secondary file:text-foreground hover:file:bg-secondary/80"
          />
          <p className="text-xs text-muted-foreground mt-1">{L(locale, 'attachHint')}</p>
          {attachError && <p className="text-xs text-red-600 mt-1">{attachError}</p>}
          {attachments.length > 0 && (
            <ul className="text-xs space-y-1 mt-2">
              {attachments.map((a, i) => (
                <li key={i} className="flex items-center justify-between bg-secondary/30 rounded px-3 py-1.5">
                  <span className="truncate">{a.name} <span className="text-muted-foreground">({a.type || 'file'})</span></span>
                  <button type="button" onClick={() => setAttachments((cur) => cur.filter((_, j) => j !== i))} className="text-red-600 hover:text-red-800">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? L(locale, 'submitting') : L(locale, 'submit')}
      </button>

      {status === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">{L(locale, 'success')}</div>
      )}
      {status === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">{L(locale, 'error')}</div>
      )}
    </form>
  );
}
