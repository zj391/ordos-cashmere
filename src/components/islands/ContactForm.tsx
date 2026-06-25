/**
 * 询盘表单 React Island
 * 支持 3 种询盘类型：原料 / 纱线面料 / 成衣代工
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
    message: 'Message',
    submit: 'Submit Inquiry',
    submitting: 'Submitting...',
    success: 'Thank you! We will contact you within 24 hours.',
    error: 'Something went wrong. Please try again or contact us via WhatsApp.',
  },
  cn: {
    typeLabel: '询盘类型', typeRaw: '羊绒原料', typeYarn: '纱线/面料', typeGarment: '成衣代工',
    name: '姓名 *', company: '公司 *', country: '国家 *', email: '邮箱 *', phone: '电话/微信',
    quantity: '预计数量', quantityHelp: '如：500kg / 5000m / 1000件', message: '留言',
    submit: '提交询盘', submitting: '提交中...', success: '感谢！我们将在24小时内联系您。',
    error: '提交失败，请重试或通过微信联系我们。',
  },
  de: {
    typeLabel: 'Anfrage-Typ', typeRaw: 'Rohmaterial', typeYarn: 'Garn & Stoff', typeGarment: 'Bekleidung OEM',
    name: 'Name *', company: 'Firma *', country: 'Land *', email: 'E-Mail *', phone: 'Telefon',
    quantity: 'Geschätzte Menge', quantityHelp: 'z.B. 500kg / 5000m / 1000 Stk.', message: 'Nachricht',
    submit: 'Anfrage senden', submitting: 'Wird gesendet...', success: 'Danke! Wir melden uns innerhalb von 24 Stunden.',
    error: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
  },
  fr: {
    typeLabel: 'Type', typeRaw: 'Matière', typeYarn: 'Fil & Tissu', typeGarment: 'Vêtement OEM',
    name: 'Nom *', company: 'Société *', country: 'Pays *', email: 'Email *', phone: 'Téléphone',
    quantity: 'Quantité estimée', quantityHelp: 'ex: 500kg / 5000m / 1000 pcs', message: 'Message',
    submit: 'Envoyer', submitting: 'Envoi...', success: 'Merci! Nous vous contacterons sous 24h.',
    error: 'Erreur. Veuillez réessayer.',
  },
  ja: {
    typeLabel: '問い合わせ種別', typeRaw: '原料', typeYarn: '糸・生地', typeGarment: '衣料OEM',
    name: 'お名前 *', company: '会社 *', country: '国 *', email: 'メール *', phone: '電話',
    quantity: '数量目安', quantityHelp: '例: 500kg / 5000m / 1000枚', message: 'メッセージ',
    submit: '送信', submitting: '送信中...', success: 'ありがとうございます！24時間以内にご連絡いたします。',
    error: 'エラーが発生しました。再試行してください。',
  },
  kr: {
    typeLabel: '문의 유형', typeRaw: '원료', typeYarn: '원사·직물', typeGarment: '의류 OEM',
    name: '이름 *', company: '회사 *', country: '국가 *', email: '이메일 *', phone: '전화',
    quantity: '예상 수량', quantityHelp: '예: 500kg / 5000m / 1000pcs', message: '메시지',
    submit: '문의 보내기', submitting: '보내는 중...', success: '감사합니다! 24시간 이내에 연락드리겠습니다.',
    error: '오류가 발생했습니다. 다시 시도해 주세요.',
  },
};

const L = (locale: string, k: string) => labels[locale]?.[k] || labels.en[k] || k;

export default function ContactForm({ locale }: Props) {
  const [type, setType] = useState<'raw' | 'yarn' | 'garment'>('raw');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus('idle');
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    try {
      const endpoint = type === 'raw' ? '/api/inquiry/raw' : type === 'yarn' ? '/api/inquiry/yarn' : '/api/inquiry/garment';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locale, type }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      (e.target as HTMLFormElement).reset();

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
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">{L(locale, 'quantity')}</label>
          <input type="text" name="quantity" placeholder={L(locale, 'quantityHelp')} className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">{L(locale, 'message')}</label>
          <textarea name="message" rows={5} className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
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
