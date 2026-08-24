/**
 * Download Gate - 资料下载前留资组件
 * 6 个静态卡片 + 单一 React 表单（client:idle），点哪个就填哪个。
 * 把原来 6 个独立 React 组件合并成一个列表 + 一个共享表单，
 * hydrate 一次，React 运行时只下载一次。
 */
import { useState } from 'react';
import { COUNTRIES, LOCALE_TO_FIELD } from '@/data/countries';

interface DownloadItem {
  type: string;
  title: string;
  size: string;
  format: string;
}

interface Props {
  locale: string;
  downloads: DownloadItem[];
}

const labels: Record<string, Record<string, string>> = {
  en: { name: 'Name *', email: 'Email *', company: 'Company *', country: 'Country *', download: 'Request Documents', cancel: 'Close', submitting: 'Sending...', done: 'Request received', desc: 'For qualified B2B buyers. Your sales contact will email the relevant current documents within 24 hours.', error: 'We could not record this request. Please try again or contact our sales team directly.' },
  cn: { name: '姓名 *', email: '邮箱 *', company: '公司 *', country: '国家 *', download: '申请资料', cancel: '关闭', submitting: '发送中...', done: '申请已收到', desc: '仅面向合格 B2B 采购商。销售团队将在 24 小时内通过邮件发送与您需求相关的最新资料。', error: '资料申请未能提交，请重试或直接联系销售团队。' },
  de: { name: 'Name *', email: 'E-Mail *', company: 'Firma *', country: 'Land *', download: 'Unterlagen anfordern', cancel: 'Schließen', submitting: 'Wird gesendet...', done: 'Anfrage erhalten', desc: 'Für qualifizierte B2B-Käufer. Ihr Ansprechpartner sendet die aktuellen relevanten Unterlagen innerhalb von 24 Stunden per E-Mail.', error: 'Die Anfrage konnte nicht erfasst werden. Bitte erneut versuchen oder den Vertrieb direkt kontaktieren.' },
  fr: { name: 'Nom *', email: 'Email *', company: 'Société *', country: 'Pays *', download: 'Demander les documents', cancel: 'Fermer', submitting: 'Envoi...', done: 'Demande reçue', desc: 'Pour les acheteurs B2B qualifiés. Votre interlocuteur commercial enverra par email les documents à jour sous 24h.', error: 'La demande n’a pas pu être enregistrée. Veuillez réessayer ou contacter directement notre équipe.' },
  ja: { name: 'お名前 *', email: 'メール *', company: '会社 *', country: '国 *', download: '資料を請求', cancel: '閉じる', submitting: '送信中...', done: '資料請求を受け付けました', desc: 'B2B バイヤー向け。担当営業より関連する最新資料を24時間以内にメールでお送りします。', error: '資料請求を記録できませんでした。もう一度お試しいただくか、営業担当へ直接ご連絡ください。' },
  kr: { name: '이름 *', email: '이메일 *', company: '회사 *', country: '국가 *', download: '자료 요청', cancel: '닫기', submitting: '보내는 중...', done: '자료 요청이 접수되었습니다', desc: '적격 B2B 바이어 대상입니다. 담당 영업팀이 관련 최신 자료를 24시간 이내에 이메일로 보내드립니다.', error: '요청을 기록하지 못했습니다. 다시 시도하거나 영업팀에 직접 문의해 주세요.' },
};

export default function DownloadsGrid({ locale, downloads }: Props) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [step, setStep] = useState<'preview' | 'submitting' | 'done' | 'error'>('preview');
  const [submitting, setSubmitting] = useState(false);
  const L = (k: string) => labels[locale]?.[k] || labels.en[k] || k;
  const active = activeIdx != null ? downloads[activeIdx] : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!active) return;
    setSubmitting(true);
    setStep('submitting');
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    try {
      const response = await fetch('/api/download-gate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: active.type, title: active.title, locale }),
      });
      if (!response.ok) throw new Error('document_request_failed');
      setStep('done');
    } catch {
      setStep('error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {downloads.map((d, i) => (
          <button
            key={d.type + d.title}
            type="button"
            onClick={() => { setActiveIdx(i); setStep('preview'); }}
            className="flex items-center gap-4 border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all text-left w-full group"
          >
            <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{d.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{d.format} · {d.size}</div>
            </div>
          </button>
        ))}
      </div>

      {active && step !== 'done' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setActiveIdx(null)}>
          <div className="w-full max-w-md border border-primary rounded-lg p-6 bg-card" onClick={(e) => e.stopPropagation()}>
            <div className="font-medium mb-2">{active.title}</div>
            <div className="text-xs text-muted-foreground mb-4">{L('desc')}</div>
            {step === 'preview' && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input name="name" required placeholder={L('name')} className="w-full px-3 py-2 border border-border rounded-none text-sm" />
                <input name="email" type="email" required placeholder={L('email')} className="w-full px-3 py-2 border border-border rounded-none text-sm" />
                <input name="company" required placeholder={L('company')} className="w-full px-3 py-2 border border-border rounded-none text-sm" />
                <select name="country" required defaultValue="" className="w-full px-3 py-2 border border-border rounded-none text-sm bg-white">
                  <option value="" disabled>{L('country')}</option>
                  {COUNTRIES.map((c) => {
                    const field = LOCALE_TO_FIELD[locale] || 'name_en';
                    const countryLabel = c[field] || c.name_en;
                    return <option key={c.code} value={c.code}>{countryLabel}</option>;
                  })}
                </select>
                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-none font-medium hover:bg-primary/90 text-sm disabled:opacity-50">
                    {submitting ? L('submitting') : L('download')}
                  </button>
                  <button type="button" onClick={() => setActiveIdx(null)} className="px-4 py-2.5 border border-border rounded-none text-sm hover:bg-secondary">
                    {L('cancel')}
                  </button>
                </div>
              </form>
            )}
            {step === 'submitting' && (
              <p className="text-sm text-muted-foreground">{L('submitting')}</p>
            )}
            {step === 'error' && (
              <div className="space-y-4" role="alert">
                <p className="text-sm text-red-700 leading-relaxed">{L('error')}</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep('preview')} className="px-4 py-2 border border-border rounded-none text-sm hover:bg-secondary">{L('download')}</button>
                  <button type="button" onClick={() => setActiveIdx(null)} className="px-4 py-2 border border-border rounded-none text-sm hover:bg-secondary">{L('cancel')}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {active && step === 'done' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setActiveIdx(null)}>
          <div className="w-full max-w-md border border-primary rounded-lg p-6 bg-card text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-2xl mb-2">✓</div>
            <div className="font-medium mb-2">{L('done')}</div>
            <div className="text-xs text-muted-foreground mb-4 leading-relaxed">{active.title} — {L('desc')}</div>
            <button type="button" onClick={() => setActiveIdx(null)} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-none font-medium hover:bg-primary/90 text-sm">
              {L('cancel')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
