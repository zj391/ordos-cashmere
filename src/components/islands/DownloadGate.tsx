/**
 * Download Gate - 资料下载前留资组件
 * B2B 转化漏斗：留资 → 自动发资料链接
 */
import { useState } from 'react';

interface Props {
  locale: string;
  type: string;
  title: string;
  size: string;
  format: string;
}

export default function DownloadGate({ locale, type, title, size, format }: Props) {
  const [step, setStep] = useState<'preview' | 'form' | 'downloading' | 'done'>('preview');
  const [submitting, setSubmitting] = useState(false);

  const labels: Record<string, Record<string, string>> = {
    en: { name: 'Name *', email: 'Email *', company: 'Company *', country: 'Country *', download: 'Download Now', cancel: 'Cancel', submitting: 'Sending...', done: 'Download Started', desc: 'B2B buyers only. We will send a copy to your email.' },
    cn: { name: '姓名 *', email: '邮箱 *', company: '公司 *', country: '国家 *', download: '立即下载', cancel: '取消', submitting: '发送中...', done: '下载已开始', desc: 'B2B采购专用。同时发送至您的邮箱。' },
    de: { name: 'Name *', email: 'E-Mail *', company: 'Firma *', country: 'Land *', download: 'Herunterladen', cancel: 'Abbrechen', submitting: 'Wird gesendet...', done: 'Download gestartet', desc: 'Nur B2B-Käufer.' },
    fr: { name: 'Nom *', email: 'Email *', company: 'Société *', country: 'Pays *', download: 'Télécharger', cancel: 'Annuler', submitting: 'Envoi...', done: 'Téléchargement lancé', desc: 'Acheteurs B2B uniquement.' },
    ja: { name: 'お名前 *', email: 'メール *', company: '会社 *', country: '国 *', download: 'ダウンロード', cancel: 'キャンセル', submitting: '送信中...', done: 'ダウンロード開始', desc: 'B2Bバイヤー専用。' },
    kr: { name: '이름 *', email: '이메일 *', company: '회사 *', country: '국가 *', download: '다운로드', cancel: '취소', submitting: '보내는 중...', done: '다운로드 시작됨', desc: 'B2B 구매자 전용.' },
  };
  const L = (k: string) => labels[locale]?.[k] || labels.en[k] || k;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    try {
      await fetch('/api/download-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type, title, locale }),
      });
      setStep('downloading');
      setTimeout(() => setStep('done'), 500);
    } catch {
      setStep('downloading');
      setTimeout(() => setStep('done'), 500);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'preview') {
    return (
      <button
        type="button"
        onClick={() => setStep('form')}
        className="flex items-center gap-4 border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all text-left w-full group"
      >
        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{title}</div>
          <div className="text-xs text-muted-foreground mt-1">{format} · {size}</div>
        </div>
      </button>
    );
  }

  if (step === 'form') {
    return (
      <div className="border border-primary rounded-lg p-6 bg-card">
        <div className="font-medium mb-2">{title}</div>
        <div className="text-xs text-muted-foreground mb-4">{L('desc')}</div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="name" required placeholder={L('name')} className="w-full px-3 py-2 border border-border rounded-md text-sm" />
          <input name="email" type="email" required placeholder={L('email')} className="w-full px-3 py-2 border border-border rounded-md text-sm" />
          <input name="company" required placeholder={L('company')} className="w-full px-3 py-2 border border-border rounded-md text-sm" />
          <input name="country" required placeholder={L('country')} className="w-full px-3 py-2 border border-border rounded-md text-sm" />
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {submitting ? L('submitting') : L('download')}
            </button>
            <button type="button" onClick={() => setStep('preview')} className="px-4 py-2 border border-border rounded-md text-sm hover:bg-accent">
              {L('cancel')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="border border-green-500 bg-green-50 rounded-lg p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500 flex items-center justify-center text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="font-medium text-green-900">{L('done')}</div>
      <div className="text-xs text-green-700 mt-1">{title}</div>
    </div>
  );
}
