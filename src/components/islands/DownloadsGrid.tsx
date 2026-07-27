---
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
  en: { name: 'Name *', email: 'Email *', company: 'Company *', country: 'Country *', download: 'Download Now', cancel: 'Cancel', submitting: 'Sending...', done: 'Download Started', desc: 'B2B buyers only. We will send a copy to your email.' },
  cn: { name: '姓名 *', email: '邮箱 *', company: '公司 *', country: '国家 *', download: '立即下载', cancel: '取消', submitting: '发送中...', done: '下载已开始', desc: 'B2B采购专用。同时发送至您的邮箱。' },
  de: { name: 'Name *', email: 'E-Mail *', company: 'Firma *', country: 'Land *', download: 'Herunterladen', cancel: 'Abbrechen', submitting: 'Wird gesendet...', done: 'Download gestartet', desc: 'Nur B2B-Käufer.' },
  fr: { name: 'Nom *', email: 'Email *', company: 'Société *', country: 'Pays *', download: 'Télécharger', cancel: 'Annuler', submitting: 'Envoi...', done: 'Téléchargement lancé', desc: 'Acheteurs B2B uniquement.' },
  ja: { name: 'お名前 *', email: 'メール *', company: '会社 *', country: '国 *', download: 'ダウンロード', cancel: 'キャンセル', submitting: '送信中...', done: 'ダウンロード開始', desc: 'B2Bバイヤー専用。' },
  kr: { name: '이름 *', email: '이메일 *', company: '회사 *', country: '국가 *', download: '다운로드', cancel: '취소', submitting: '보내는 중...', done: '다운로드 시작됨', desc: 'B2B 구매자 전용.' },
};

export default function DownloadsGrid({ locale, downloads }: Props) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [step, setStep] = useState<'preview' | 'submitting' | 'done'>('preview');
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
      await fetch('/api/download-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: active.type, title: active.title, locale }),
      });
    } catch {
      // Network failure is non-fatal; the form should still show the success
      // state so the user can download the file. (Lead tracking is best-effort.)
    } finally {
      setSubmitting(false);
      setStep('done');
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
            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
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
                <input name="name" required placeholder={L('name')} className="w-full px-3 py-2 border border-border rounded-md text-sm" />
                <input name="email" type="email" required placeholder={L('email')} className="w-full px-3 py-2 border border-border rounded-md text-sm" />
                <input name="company" required placeholder={L('company')} className="w-full px-3 py-2 border border-border rounded-md text-sm" />
                <select name="country" required defaultValue="" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white">
                  <option value="" disabled>{L('country')}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={LOCALE_TO_FIELD[c.code] || c.code}>{c.name}</option>
                  ))}
                </select>
                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 text-sm disabled:opacity-50">
                    {submitting ? L('submitting') : L('download')}
                  </button>
                  <button type="button" onClick={() => setActiveIdx(null)} className="px-4 py-2.5 border border-border rounded-md text-sm hover:bg-secondary">
                    {L('cancel')}
                  </button>
                </div>
              </form>
            )}
            {step === 'submitting' && (
              <p className="text-sm text-muted-foreground">{L('submitting')}</p>
            )}
          </div>
        </div>
      )}

      {active && step === 'done' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setActiveIdx(null)}>
          <div className="w-full max-w-md border border-primary rounded-lg p-6 bg-card text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-2xl mb-2">✓</div>
            <div className="font-medium mb-2">{L('done')}</div>
            <div className="text-xs text-muted-foreground mb-4">{active.title}</div>
            <button type="button" onClick={() => setActiveIdx(null)} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 text-sm">
              {L('cancel')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}