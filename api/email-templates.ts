/**
 * 询盘回执邮件模板库（6 国 i18n）
 * Customer-facing auto-reply sent via Resend after inquiry submit.
 *
 * 设计原则：
 * - 单一品牌身份（DONGXIAO® Cashmere · Ordos · Since 2002）
 * - 6 国同源结构，差异只在文案 + 字体（中文 PingFang / 西文 Inter / 日文 Noto Sans JP / 韩文 Noto Sans KR）
 * - 字段自适应（quantity/delivery_date/attachments 可选）
 * - HTML 简洁内联样式（兼容 Gmail/Outlook/iOS Mail）
 */

const BRAND = {
  name: 'DONGXIAO® Cashmere',
  wechatId: 'dongxiaocashmere',
  whatsapp: '+86-156-6185-3999',
  email: 'dongxiaocashmere@erdosdx.com',
  phone: '+86 180 4776 1108',
};

const INQUIRY_TYPE_LABEL: Record<string, Record<string, string>> = {
  raw: { en: 'Raw Material', cn: '羊绒原料', de: 'Rohmaterial', fr: 'Matière première', ja: '原料', kr: '원료' },
  yarn: { en: 'Yarn & Fabric', cn: '纱线/面料', de: 'Garn & Stoff', fr: 'Fil & Tissu', ja: '糸・生地', kr: '원사·원단' },
  garment: { en: 'Garment OEM', cn: '成衣代工', de: 'Bekleidung OEM', fr: 'Vêtement OEM', ja: '衣料OEM', kr: '의류 OEM' },
};

const FONTS: Record<string, string> = {
  en: "Inter, system-ui, 'Helvetica Neue', Arial, sans-serif",
  cn: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  de: "Inter, system-ui, 'Helvetica Neue', Arial, sans-serif",
  fr: "Inter, system-ui, 'Helvetica Neue', Arial, sans-serif",
  ja: "'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', 'Noto Sans JP', sans-serif",
  kr: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif",
};

interface InquiryPayload {
  type: 'raw' | 'yarn' | 'garment';
  name: string;
  company: string;
  country: string;
  email: string;
  phone?: string;
  quantity?: string;
  delivery_date?: string;
  message?: string;
  attachments?: Array<{ name: string; type: string; dataUrl: string }>;
}

const I18N: Record<string, {
  subject: (label: string) => string;
  greeting: (name: string) => string;
  intro: (label: string) => string;
  fieldCompany: string;
  fieldCountry: string;
  fieldType: string;
  fieldQuantity: string;
  fieldDelivery: string;
  fieldPhone: string;
  fieldMessage: string;
  fieldAttachments: string;
  promise: string;
  wechatLabel: string;
  whatsappLabel: string;
  emailLabel: string;
  footer: string;
  receiptTitle: string;
}> = {
  en: {
    subject: (l) => `[DONGXIAO Cashmere] Your ${l} inquiry received - reply within 24h`,
    greeting: (n) => `Dear ${n},`,
    intro: (l) => `Thank you for your interest in DONGXIAO® Cashmere. We have received your inquiry regarding <strong>${l}</strong>.`,
    fieldCompany: 'Company', fieldCountry: 'Country', fieldType: 'Inquiry Type',
    fieldQuantity: 'Estimated Quantity', fieldDelivery: 'Required Delivery Date',
    fieldPhone: 'Phone / WhatsApp', fieldMessage: 'Message',
    fieldAttachments: 'Attachments',
    promise: 'Our sales specialist will contact you via <strong>WhatsApp or email within 24 hours</strong>, providing detailed quotation, product catalogs, and sampling arrangements.',
    wechatLabel: 'WeChat', whatsappLabel: 'WhatsApp', emailLabel: 'Email',
    footer: 'This is an automated email. Please do not reply directly. For urgent matters, contact us via WhatsApp.',
    receiptTitle: 'PREMIUM CASHMERE · ORDOS · SINCE 2002',
  },
  cn: {
    subject: (l) => `【东霄羊绒】已收到您的${l}咨询，24小时内回复`,
    greeting: (n) => `尊敬的 ${n} 您好，`,
    intro: (l) => `感谢您对东霄羊绒的关注。我们已收到您关于<strong>${l}</strong>的咨询。`,
    fieldCompany: '公司', fieldCountry: '国家', fieldType: '询盘类型',
    fieldQuantity: '预计数量', fieldDelivery: '期望交货日期',
    fieldPhone: '电话 / 微信', fieldMessage: '留言',
    fieldAttachments: '附件',
    promise: '我们的销售专家将在<strong>24小时内</strong>通过微信或邮件与您联系，提供详细报价、产品资料和样品方案。',
    wechatLabel: '微信', whatsappLabel: 'WhatsApp', emailLabel: '邮箱',
    footer: '本邮件由系统自动发送，请勿直接回复。如有紧急事宜，请通过微信或 WhatsApp 联系我们。',
    receiptTitle: '鄂尔多斯源头工厂 · 23年羊绒供应链',
  },
  de: {
    subject: (l) => `[DONGXIAO Cashmere] Ihre ${l}-Anfrage erhalten - Antwort innerhalb von 24h`,
    greeting: (n) => `Sehr geehrte(r) ${n},`,
    intro: (l) => `Vielen Dank für Ihr Interesse an DONGXIAO® Cashmere. Wir haben Ihre Anfrage zu <strong>${l}</strong> erhalten.`,
    fieldCompany: 'Firma', fieldCountry: 'Land', fieldType: 'Anfrage-Typ',
    fieldQuantity: 'Geschätzte Menge', fieldDelivery: 'Wunschliefertermin',
    fieldPhone: 'Telefon', fieldMessage: 'Nachricht',
    fieldAttachments: 'Anhänge',
    promise: 'Unser Vertriebsspezialist wird Sie innerhalb von <strong>24 Stunden per WhatsApp oder E-Mail</strong> kontaktieren und ein detailliertes Angebot, Produktkataloge und Muster bereitstellen.',
    wechatLabel: 'WeChat', whatsappLabel: 'WhatsApp', emailLabel: 'E-Mail',
    footer: 'Diese E-Mail wurde automatisch versendet. Bitte antworten Sie nicht direkt. Bei dringenden Angelegenheiten kontaktieren Sie uns per WhatsApp.',
    receiptTitle: 'PREMIUM-KASCHMIR · ORDOS · SEIT 2002',
  },
  fr: {
    subject: (l) => `[DONGXIAO Cashmere] Votre demande ${l} reçue - réponse sous 24h`,
    greeting: (n) => `Bonjour ${n},`,
    intro: (l) => `Merci pour votre intérêt pour DONGXIAO® Cashmere. Nous avons bien reçu votre demande concernant <strong>${l}</strong>.`,
    fieldCompany: 'Société', fieldCountry: 'Pays', fieldType: 'Type de demande',
    fieldQuantity: 'Quantité estimée', fieldDelivery: 'Date de livraison souhaitée',
    fieldPhone: 'Téléphone', fieldMessage: 'Message',
    fieldAttachments: 'Pièces jointes',
    promise: 'Notre spécialiste commercial vous contactera par <strong>WhatsApp ou e-mail dans les 24 heures</strong>, avec un devis détaillé, des catalogues et des arrangements d\'échantillons.',
    wechatLabel: 'WeChat', whatsappLabel: 'WhatsApp', emailLabel: 'E-mail',
    footer: 'Cet e-mail est automatique. Veuillez ne pas répondre directement. Pour toute urgence, contactez-nous via WhatsApp.',
    receiptTitle: 'CACHEMIRE PREMIUM · ORDOS · DEPUIS 2002',
  },
  ja: {
    subject: (l) => `【DONGXIAO Cashmere】${l}のお問い合わせ受付 - 24時間以内に返信`,
    greeting: (n) => `${n} 様`,
    intro: (l) => `DONGXIAO® Cashmere にご関心をお寄せいただき、ありがとうございます。<strong>${l}</strong>のお問い合わせを受け付けました。`,
    fieldCompany: '会社', fieldCountry: '国', fieldType: 'お問い合わせ種別',
    fieldQuantity: '数量目安', fieldDelivery: '希望納期',
    fieldPhone: '電話', fieldMessage: 'メッセージ',
    fieldAttachments: '添付ファイル',
    promise: '弊社営業担当者が<strong>24時間以内に WhatsApp またはメール</strong>でご連絡し、詳細な見積もり、製品カタログ、サンプル手配をご案内いたします。',
    wechatLabel: 'WeChat', whatsappLabel: 'WhatsApp', emailLabel: 'メール',
    footer: 'このメールは自動送信です。直接返信はご遠慮ください。緊急のご連絡は WhatsApp でお願いいたします。',
    receiptTitle: 'プレミアム・カシミア · オルドス · 2002年創業',
  },
  kr: {
    subject: (l) => `[DONGXIAO Cashmere] ${l} 문의 접수 - 24시간 이내 회신`,
    greeting: (n) => `${n}님 안녕하세요,`,
    intro: (l) => `DONGXIAO® Cashmere에 관심을 가져주셔서 감사합니다. <strong>${l}</strong> 관련 문의가 접수되었습니다.`,
    fieldCompany: '회사', fieldCountry: '국가', fieldType: '문의 유형',
    fieldQuantity: '예상 수량', fieldDelivery: '희망 납기일',
    fieldPhone: '전화', fieldMessage: '메시지',
    fieldAttachments: '첨부파일',
    promise: '당사 영업 담당자가 <strong>24시간 이내에 WhatsApp 또는 이메일</strong>로 연락드려 상세 견적, 제품 카탈로그, 샘플 안내를 제공해 드리겠습니다.`,
    wechatLabel: 'WeChat', whatsappLabel: 'WhatsApp', emailLabel: '이메일',
    footer: '이 이메일은 자동 발송되었습니다. 직접 회신하지 마시고, 긴급한 사항은 WhatsApp으로 연락 주십시오.',
    receiptTitle: '프리미엄 캐시미어 · 오르도스 · 2002년 설립',
  },
};

/**
 * Format an ISO date string (YYYY-MM-DD) into a locale-friendly long form.
 * Falls back to the raw string on parse failure.
 */
function formatDate(iso: string, locale: string): string {
  try {
    const d = new Date(iso + 'T00:00:00Z');
    if (isNaN(d.getTime())) return iso;
    const localeMap: Record<string, string> = {
      en: 'en-US', cn: 'zh-CN', de: 'de-DE', fr: 'fr-FR', ja: 'ja-JP', kr: 'ko-KR',
    };
    return d.toLocaleDateString(localeMap[locale] || 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

/**
 * Render a confirmation email for the customer.
 * @param locale - one of en/cn/de/fr/ja/kr
 * @param data - the inquiry payload
 */
export function renderCustomerEmail(locale: string, data: InquiryPayload): { subject: string; html: string } {
  const safeLocale = (locale in I18N) ? locale : 'en';
  const t = I18N[safeLocale];
  const label = INQUIRY_TYPE_LABEL[data.type]?.[safeLocale] || data.type;
  const font = FONTS[safeLocale];
  const subject = t.subject(label);
  const isCN = safeLocale === 'cn';

  // Build the dynamic rows (only render when value present)
  const rows: string[] = [
    `<tr style="background:#F5F1EA;"><td style="padding:8px 12px;width:140px;font-weight:600;">${t.fieldCompany}</td><td style="padding:8px 12px;">${escapeHtml(data.company)}</td></tr>`,
    `<tr><td style="padding:8px 12px;background:#F5F1EA;font-weight:600;">${t.fieldCountry}</td><td style="padding:8px 12px;">${escapeHtml(data.country)}</td></tr>`,
    `<tr style="background:#F5F1EA;"><td style="padding:8px 12px;font-weight:600;">${t.fieldType}</td><td style="padding:8px 12px;">${escapeHtml(label)}</td></tr>`,
  ];
  if (data.quantity) {
    rows.push(`<tr><td style="padding:8px 12px;background:#F5F1EA;font-weight:600;">${t.fieldQuantity}</td><td style="padding:8px 12px;">${escapeHtml(data.quantity)}</td></tr>`);
  }
  if (data.delivery_date) {
    rows.push(`<tr style="background:#F5F1EA;"><td style="padding:8px 12px;font-weight:600;">${t.fieldDelivery}</td><td style="padding:8px 12px;">${escapeHtml(formatDate(data.delivery_date, safeLocale))}</td></tr>`);
  }
  if (data.phone) {
    rows.push(`<tr><td style="padding:8px 12px;background:#F5F1EA;font-weight:600;">${t.fieldPhone}</td><td style="padding:8px 12px;">${escapeHtml(data.phone)}</td></tr>`);
  }
  if (data.message) {
    rows.push(`<tr style="background:#F5F1EA;vertical-align:top;"><td style="padding:8px 12px;font-weight:600;">${t.fieldMessage}</td><td style="padding:8px 12px;white-space:pre-wrap;">${escapeHtml(data.message)}</td></tr>`);
  }
  if (data.attachments && data.attachments.length > 0) {
    const attList = data.attachments
      .map((a) => `<li style="margin:2px 0;">${escapeHtml(a.name)} <span style="color:#888;font-size:12px;">(${a.type || 'file'})</span></li>`)
      .join('');
    rows.push(`<tr><td style="padding:8px 12px;background:#F5F1EA;font-weight:600;vertical-align:top;">${t.fieldAttachments}</td><td style="padding:8px 12px;"><ul style="margin:0;padding-left:20px;">${attList}</ul></td></tr>`);
  }

  const html = `<!DOCTYPE html>
<html lang="${safeLocale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F1EA;font-family:${font};">
  <div style="max-width:600px;margin:0 auto;background:#fff;padding:0;">
    <div style="border-bottom:2px solid #5C3E2A;padding:30px 30px 20px;${isCN ? 'font-family:' + font : ''}">
      <h1 style="font-size:24px;margin:0;color:#5C3E2A;font-weight:${isCN ? '600' : '400'};">${isCN ? '东霄羊绒' : 'DONGXIAO<sup style=\"font-size:12px;\">®</sup> CASHMERE'}</h1>
      <p style="margin:5px 0 0;font-size:12px;color:#A8875E;letter-spacing:2px;">${t.receiptTitle}</p>
    </div>
    <div style="padding:30px;">
      <p style="margin:0 0 16px;">${t.greeting(escapeHtml(data.name))}</p>
      <p style="margin:0 0 20px;line-height:1.6;">${t.intro(label)}</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">${rows.join('')}</table>
      <p style="line-height:1.6;margin:20px 0;">${t.promise}</p>
      <div style="background:#F5F1EA;padding:20px;border-radius:8px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:14px;"><strong>📱 ${t.whatsappLabel}:</strong> <a href="https://wa.me/${BRAND.whatsapp.replace(/[^\d+]/g, '')}" style="color:#5C3E2A;text-decoration:none;">${BRAND.whatsapp}</a></p>
        <p style="margin:0 0 8px;font-size:14px;"><strong>💬 ${t.wechatLabel}:</strong> ${BRAND.wechatId}</p>
        <p style="margin:0;font-size:14px;"><strong>📧 ${t.emailLabel}:</strong> <a href="mailto:${BRAND.email}" style="color:#5C3E2A;text-decoration:none;">${BRAND.email}</a></p>
      </div>
      <p style="font-size:12px;color:#888;margin-top:30px;line-height:1.5;">${t.footer}</p>
    </div>
    <div style="background:#5C3E2A;color:#fff;padding:16px 30px;text-align:center;font-size:12px;">
      © ${new Date().getFullYear()} Ordos Dongxiao Cashmere Products Factory · Since 2002
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

// Minimal HTML escape for user-controlled values
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}