/**
 * 询盘表单 React Island
 * 支持 3 种询盘类型：原料 / 纱线面料 / 成衣代工
 *
 * 7-8 增强：附件上传（base64 内联）+ 期望交期 + honeypot 防 bot
 */
import { useEffect, useState } from 'react';
import { COUNTRIES, LOCALE_TO_FIELD } from '@/data/countries';
import type { CartItem } from '@/lib/inquiry-cart';

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
const CART_HANDOFF_KEY = 'dx-cart-handoff-v1';
const QUALIFICATION_LABELS: Record<string, Record<string, string>> = {
  en: {
    title: 'Purchase profile', hint: 'Optional details help us prepare a more relevant quotation.', industry: 'Business type', companySize: 'Company size', jobTitle: 'Job title', productReference: 'Product reference',
    luxury_brand: 'Luxury / premium brand', mid_luxury_brand: 'Fashion brand', distributor: 'Importer / distributor', manufacturer: 'Manufacturer', wholesaler: 'Wholesaler', retailer: 'Retailer / e-commerce', designer_independent: 'Independent designer',
    startup: '1–10 people', small: '11–50 people', mid: '51–500 people', large: '501–5,000 people', enterprise: '5,000+ people', successTitle: 'Inquiry received', successDetail: 'We have sent your request to our sales team. Expect pricing, samples and lead-time guidance within 24 hours.',
  },
  cn: {
    title: '采购资料', hint: '选填信息可帮助我们准备更匹配的报价。', industry: '业务类型', companySize: '公司规模', jobTitle: '职位', productReference: '产品参考',
    luxury_brand: '高端 / 奢侈品牌', mid_luxury_brand: '时尚品牌', distributor: '进口商 / 经销商', manufacturer: '制造商', wholesaler: '批发商', retailer: '零售 / 电商', designer_independent: '独立设计师',
    startup: '1–10 人', small: '11–50 人', mid: '51–500 人', large: '501–5,000 人', enterprise: '5,000+ 人', successTitle: '询盘已收到', successDetail: '您的需求已发送给销售团队，我们将在 24 小时内提供报价、样品及交期建议。',
  },
  de: {
    title: 'Einkaufsprofil', hint: 'Optionale Angaben helfen uns, ein passenderes Angebot vorzubereiten.', industry: 'Unternehmenstyp', companySize: 'Unternehmensgröße', jobTitle: 'Position', productReference: 'Produktreferenz',
    luxury_brand: 'Luxus- / Premiummarke', mid_luxury_brand: 'Modemarke', distributor: 'Importeur / Distributor', manufacturer: 'Hersteller', wholesaler: 'Großhändler', retailer: 'Handel / E-Commerce', designer_independent: 'Unabhängiger Designer',
    startup: '1–10 Personen', small: '11–50 Personen', mid: '51–500 Personen', large: '501–5.000 Personen', enterprise: '5.000+ Personen', successTitle: 'Anfrage erhalten', successDetail: 'Unser Vertriebsteam antwortet innerhalb von 24 Stunden mit Preis-, Muster- und Lieferzeitinformationen.',
  },
  fr: {
    title: 'Profil d’achat', hint: 'Ces informations facultatives nous aident à préparer une offre pertinente.', industry: 'Type d’entreprise', companySize: 'Taille de l’entreprise', jobTitle: 'Fonction', productReference: 'Référence produit',
    luxury_brand: 'Marque luxe / premium', mid_luxury_brand: 'Marque de mode', distributor: 'Importateur / distributeur', manufacturer: 'Fabricant', wholesaler: 'Grossiste', retailer: 'Détaillant / e-commerce', designer_independent: 'Designer indépendant',
    startup: '1–10 personnes', small: '11–50 personnes', mid: '51–500 personnes', large: '501–5 000 personnes', enterprise: '5 000+ personnes', successTitle: 'Demande reçue', successDetail: 'Notre équipe commerciale vous répondra sous 24h avec prix, échantillons et délais.',
  },
  ja: {
    title: '購買プロフィール', hint: '任意の情報ですが、より適切なお見積もりの準備に役立ちます。', industry: '事業タイプ', companySize: '会社規模', jobTitle: '役職', productReference: '製品参照',
    luxury_brand: '高級・プレミアムブランド', mid_luxury_brand: 'ファッションブランド', distributor: '輸入業者・代理店', manufacturer: 'メーカー', wholesaler: '卸売業者', retailer: '小売・EC', designer_independent: '独立デザイナー',
    startup: '1–10名', small: '11–50名', mid: '51–500名', large: '501–5,000名', enterprise: '5,000名以上', successTitle: 'お問い合わせを受け付けました', successDetail: '営業チームが内容を確認し、24時間以内に価格・サンプル・納期をご案内します。',
  },
  kr: {
    title: '구매 프로필', hint: '선택 정보는 더 적합한 견적을 준비하는 데 도움이 됩니다.', industry: '사업 유형', companySize: '회사 규모', jobTitle: '직책', productReference: '제품 참조',
    luxury_brand: '럭셔리 / 프리미엄 브랜드', mid_luxury_brand: '패션 브랜드', distributor: '수입업체 / 유통업체', manufacturer: '제조업체', wholesaler: '도매업체', retailer: '리테일 / 이커머스', designer_independent: '독립 디자이너',
    startup: '1–10명', small: '11–50명', mid: '51–500명', large: '501–5,000명', enterprise: '5,000명 이상', successTitle: '문의가 접수되었습니다', successDetail: '영업팀이 요청을 확인하고 24시간 이내에 가격, 샘플 및 납기 정보를 안내합니다.',
  },
};
const Q = (locale: string, key: string) => QUALIFICATION_LABELS[locale]?.[key] || QUALIFICATION_LABELS.en[key] || key;
const INDUSTRY_OPTIONS = ['luxury_brand', 'mid_luxury_brand', 'distributor', 'manufacturer', 'wholesaler', 'retailer', 'designer_independent'] as const;
const COMPANY_SIZE_OPTIONS = ['startup', 'small', 'mid', 'large', 'enterprise'] as const;
const SALES_ROUTE_COPY: Record<string, Record<string, string>> = {
  en: { title: 'Sales follow-up', hint: 'Choose the most useful starting point for your buying team.', channel: 'Preferred follow-up', intent: 'Current purchase intent', email: 'Email proposal', whatsapp: 'WhatsApp', wechat: 'WeChat', quote: 'Quotation & MOQ', samples: 'Sample development', documents: 'Compliance / documents', factory: 'Factory visit / production review', internationalHint: 'International buyers can continue by email or WhatsApp; our sales team will align time zone and delivery terms with your destination market.' },
  cn: { title: '销售跟进', hint: '选择最适合贵司采购团队的沟通起点。', channel: '首选跟进方式', intent: '当前采购意图', email: '邮件报价', whatsapp: 'WhatsApp', wechat: '微信', quote: '报价与起订量', samples: '样品开发', documents: '合规 / 资料文件', factory: '工厂参观 / 产能审核', internationalHint: '中文采购团队可优先选择微信或邮件；销售团队将根据您的目的市场同步交期与贸易条款。' },
  de: { title: 'Vertriebsnachverfolgung', hint: 'Wählen Sie den passenden Startpunkt für Ihr Einkaufsteam.', channel: 'Bevorzugter Kontaktweg', intent: 'Aktuelle Kaufabsicht', email: 'Angebot per E-Mail', whatsapp: 'WhatsApp', wechat: 'WeChat', quote: 'Angebot & MOQ', samples: 'Musterentwicklung', documents: 'Compliance / Unterlagen', factory: 'Werksbesuch / Produktionsprüfung', internationalHint: 'Internationale Käufer können per E-Mail oder WhatsApp fortfahren; unser Vertrieb stimmt Zeitzone und Lieferbedingungen auf Ihren Zielmarkt ab.' },
  fr: { title: 'Suivi commercial', hint: 'Choisissez le point de départ le plus utile pour votre équipe achats.', channel: 'Canal de suivi préféré', intent: 'Intention d’achat actuelle', email: 'Proposition par e-mail', whatsapp: 'WhatsApp', wechat: 'WeChat', quote: 'Devis & MOQ', samples: 'Développement d’échantillons', documents: 'Conformité / documents', factory: 'Visite usine / revue production', internationalHint: 'Les acheteurs internationaux peuvent poursuivre par e-mail ou WhatsApp ; notre équipe aligne fuseau horaire et conditions de livraison sur votre marché.' },
  ja: { title: '営業フォロー', hint: '購買チームに適した相談の起点を選択してください。', channel: '希望連絡手段', intent: '現在の購買目的', email: 'メールで見積もり', whatsapp: 'WhatsApp', wechat: 'WeChat', quote: '見積もり・MOQ', samples: 'サンプル開発', documents: 'コンプライアンス・資料', factory: '工場訪問・生産確認', internationalHint: '海外のお客様はメールまたは WhatsApp でご連絡いただけます。営業チームが仕向地に合わせて時差と納品条件を調整します。' },
  kr: { title: '영업 후속 안내', hint: '구매팀에 가장 적합한 상담 시작점을 선택하세요.', channel: '선호 연락 방식', intent: '현재 구매 목적', email: '이메일 견적', whatsapp: 'WhatsApp', wechat: 'WeChat', quote: '견적 및 MOQ', samples: '샘플 개발', documents: '규정 준수 / 자료', factory: '공장 방문 / 생산 검토', internationalHint: '해외 구매자는 이메일 또는 WhatsApp으로 계속 상담할 수 있으며, 영업팀이 목적 시장에 맞춰 시차와 납품 조건을 조율합니다.' },
};
const S = (locale: string, key: string) => SALES_ROUTE_COPY[locale]?.[key] || SALES_ROUTE_COPY.en[key] || key;

export default function ContactForm({ locale }: Props) {
  const [type, setType] = useState<'raw' | 'yarn' | 'garment'>('raw');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [attachments, setAttachments] = useState<Array<{ name: string; type: string; dataUrl: string }>>([]);
  const [attachError, setAttachError] = useState<string>('');
  const [productInterest, setProductInterest] = useState('');

  // Cart handoff: prefer sessionStorage; keep legacy ?items=<base64> support for one version.
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const productReference = params.get('product');
    if (productReference) {
      setProductInterest(productReference);
      setType('garment');
    }
    if (params.get('from') !== 'cart') return;

    const storedItems = sessionStorage.getItem(CART_HANDOFF_KEY);
    if (storedItems) {
      try {
        const parsed = JSON.parse(storedItems) as CartItem[];
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
          return;
        }
      } catch (err) {
        console.warn('[contact] failed to parse cart handoff from sessionStorage', err);
      } finally {
        sessionStorage.removeItem(CART_HANDOFF_KEY);
      }
    }

    const legacyItems = params.get('items');
    if (!legacyItems) return;
    try {
      const json = decodeURIComponent(escape(atob(decodeURIComponent(legacyItems))));
      const parsed = JSON.parse(json) as CartItem[];
      if (Array.isArray(parsed)) setCartItems(parsed);
    } catch (err) {
      console.warn('[contact] failed to parse legacy cart handoff', err);
    }
  }, []);

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
    payload.market_preference = locale === 'cn' ? 'china' : 'international';
    if (cartItems.length > 0) payload.cart_items = cartItems;
    if (attachments.length > 0) payload.attachments = attachments;
    if (productInterest) payload.product_interest = productInterest;
    if (!payload.product_interest && cartItems.length > 0) {
      payload.product_interest = cartItems.map((item) => `${item.id}${item.color ? ` (${item.color})` : ''}`).join(', ');
    }
    const params = new URLSearchParams(window.location.search);
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) {
      const value = params.get(key);
      if (value) payload[key] = value;
    }
    if (document.referrer) payload.referrer = document.referrer;
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errMsg = '';
        try { const j = await res.json(); errMsg = j.error || JSON.stringify(j); } catch { errMsg = 'HTTP ' + res.status; }
        throw new Error(errMsg);
      }
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
      fetch('https://www.erdosdx.com/api/inquiry?action=event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: 'contact_submit',
          inquiry_type: type,
          locale,
        }),
      }).catch(() => {});
    } catch (e: any) {
      console.error('[contact] submit failed:', e?.message);
      setStatus('error');
      (window as any).__lastContactError = e?.message || 'unknown';
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
              className={`px-4 py-3 border rounded-none text-sm font-medium transition-colors ${
                type === t ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'
              }`}
            >
              {L(locale, `type${t.charAt(0).toUpperCase() + t.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      {productInterest && (
        <div className="border border-primary/25 bg-primary/5 rounded-none px-4 py-3 text-sm">
          <span className="font-medium">{Q(locale, 'productReference')}:</span> <span className="text-muted-foreground">{productInterest}</span>
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="border border-primary/30 bg-primary/5 rounded-none p-4 mb-2">
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Your Inquiry List ({cartItems.length} items)
          </h3>
          <ul className="text-xs space-y-1 mb-3 max-h-40 overflow-y-auto">
            {cartItems.map((it, i) => (
              <li key={i} className="flex justify-between gap-2">
                <span className="truncate">{i + 1}. {it.name}{it.color ? ' [' + it.color + ']' : ''}</span>
                <span className="text-muted-foreground whitespace-nowrap">{it.qty} pcs</span>
              </li>
            ))}
          </ul>
          <a href={`/${locale}/cart/`} className="text-xs text-primary hover:underline">← Edit inquiry list</a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{L(locale, 'name')}</label>
          <input type="text" name="name" required className="w-full px-4 py-3 border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{L(locale, 'company')}</label>
          <input type="text" name="company" required className="w-full px-4 py-3 border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{L(locale, 'country')}</label>
          <select name="country" required defaultValue="" className="w-full px-4 py-3 border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-primary bg-white">
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
          <input type="email" name="email" required className="w-full px-4 py-3 border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">{L(locale, 'phone')}</label>
          <input type="tel" name="phone" className="w-full px-4 py-3 border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <fieldset className="md:col-span-2 border-t border-border pt-5 mt-1">
          <legend className="text-sm font-medium">{Q(locale, 'title')}</legend>
          <p className="text-xs text-muted-foreground mt-1 mb-3">{Q(locale, 'hint')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{Q(locale, 'industry')}</label>
              <select name="industry" defaultValue="" className="w-full px-4 py-3 border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                <option value="">—</option>
                {INDUSTRY_OPTIONS.map((option) => <option key={option} value={option}>{Q(locale, option)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{Q(locale, 'companySize')}</label>
              <select name="company_size" defaultValue="" className="w-full px-4 py-3 border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                <option value="">—</option>
                {COMPANY_SIZE_OPTIONS.map((option) => <option key={option} value={option}>{Q(locale, option)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{Q(locale, 'jobTitle')}</label>
              <input type="text" name="job_title" className="w-full px-4 py-3 border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
        </fieldset>
        <fieldset className="md:col-span-2 border-t border-border pt-5 mt-1">
          <legend className="text-sm font-medium">{S(locale, 'title')}</legend>
          <p className="text-xs text-muted-foreground mt-1 mb-3">{S(locale, 'hint')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{S(locale, 'channel')}</label>
              <select name="preferred_channel" defaultValue={locale === 'cn' ? 'wechat' : 'email'} className="w-full px-4 py-3 border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                <option value="email">{S(locale, 'email')}</option>
                <option value="whatsapp">{S(locale, 'whatsapp')}</option>
                <option value="wechat">{S(locale, 'wechat')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{S(locale, 'intent')}</label>
              <select name="purchase_intent" defaultValue="quote" className="w-full px-4 py-3 border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                <option value="quote">{S(locale, 'quote')}</option>
                <option value="samples">{S(locale, 'samples')}</option>
                <option value="documents">{S(locale, 'documents')}</option>
                <option value="factory">{S(locale, 'factory')}</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{S(locale, 'internationalHint')}</p>
        </fieldset>
        <div>
          <label className="block text-sm font-medium mb-2">{L(locale, 'delivery_date')}</label>
          <input type="date" name="delivery_date" className="w-full px-4 py-3 border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{L(locale, 'quantity')}</label>
          <input type="text" name="quantity" placeholder={L(locale, 'quantityHelp')} className="w-full px-4 py-3 border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">{L(locale, 'message')}</label>
          <textarea name="message" rows={5} defaultValue={cartItems.length > 0 ? 'INQUIRY LIST (from my saved list):\n' + cartItems.map((it, i) => `${i + 1}. ${it.name}${it.color ? ' [' + it.color + ']' : ''} — SKU ${it.id} — qty ${it.qty}${it.note ? ' — note: ' + it.note : ''}`).join('\n') + '\n\n' : ''} className="w-full px-4 py-3 border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
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
        className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-none font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? L(locale, 'submitting') : L(locale, 'submit')}
      </button>

      {status === 'success' && (
        <div className="p-5 bg-green-50 border border-green-200 text-green-900 rounded-none text-sm" role="status" aria-live="polite">
          <p className="font-semibold mb-1">{Q(locale, 'successTitle')}</p>
          <p className="text-green-800/85 leading-relaxed">{Q(locale, 'successDetail')}</p>
        </div>
      )}
      {status === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-none text-sm">{L(locale, 'error')}</div>
      )}
    </form>
  );
}
