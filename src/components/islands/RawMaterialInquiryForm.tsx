/**
 * 原料批量采购询盘表单（产品页专用，无类型切换）
 * Endpoint: POST /api/inquiry/raw
 */
import ProductInquiryForm from './ProductInquiryForm';

export default function RawMaterialInquiryForm({ locale }: { locale: string }) {
  return (
    <ProductInquiryForm
      locale={locale}
      productType="raw"
      endpoint="/api/inquiry/raw"
      title={{
        en: 'Raw Cashmere Bulk Inquiry',
        cn: '羊绒原料批量询盘',
        de: 'Rohkaschmir Großhandelsanfrage',
        fr: 'Cachemire brut - demande de devis',
        ja: '原料カシミア大量見積依頼',
        kr: '원료 캐시미어 대량 견적 문의',
      }}
      submitLabel={{
        en: 'Submit Bulk Inquiry', cn: '提交批量询盘', de: 'Anfrage senden',
        fr: 'Envoyer la demande', ja: '送信する', kr: '문의 보내기',
      }}
      submittingLabel={{
        en: 'Submitting...', cn: '提交中...', de: 'Wird gesendet...',
        fr: 'Envoi...', ja: '送信中...', kr: '보내는 중...',
      }}
      successMsg={{
        en: 'Thank you! Our raw material team will contact you within 24 hours with a quotation.',
        cn: '感谢！原料团队将在24小时内联系您并提供报价。',
        de: 'Danke! Unser Rohmaterial-Team meldet sich innerhalb von 24 Stunden mit einem Angebot.',
        fr: 'Merci ! Notre équipe matière première vous contactera sous 24h avec un devis.',
        ja: 'ありがとうございます！原料チームが24時間以内に見積もりをご連絡いたします。',
        kr: '감사합니다! 원료 팀이 24시간 이내에 견적과 함께 연락드리겠습니다.',
      }}
      errorMsg={{
        en: 'Submission failed. Please try again or contact us via WhatsApp.',
        cn: '提交失败，请重试或通过微信联系我们。',
        de: 'Fehler. Bitte erneut versuchen oder per WhatsApp kontaktieren.',
        fr: 'Échec. Veuillez réessayer ou nous contacter via WhatsApp.',
        ja: '送信に失敗しました。再試行するかWhatsAppでご連絡ください。',
        kr: '실패했습니다. 다시 시도하거나 WhatsApp으로 연락해 주세요.',
      }}
      fields={[
        {
          name: 'name', required: true,
          label: { en: 'Your Name *', cn: '姓名 *', de: 'Name *', fr: 'Nom *', ja: 'お名前 *', kr: '이름 *' },
        },
        {
          name: 'company', required: true,
          label: { en: 'Company *', cn: '公司 *', de: 'Firma *', fr: 'Société *', ja: '会社 *', kr: '회사 *' },
        },
        {
          name: 'country', required: true,
          label: { en: 'Country *', cn: '国家 *', de: 'Land *', fr: 'Pays *', ja: '国 *', kr: '국가 *' },
        },
        {
          name: 'email', type: 'email', required: true,
          label: { en: 'Email *', cn: '邮箱 *', de: 'E-Mail *', fr: 'Email *', ja: 'メール *', kr: '이메일 *' },
        },
        {
          name: 'phone', type: 'tel',
          label: { en: 'Phone / WhatsApp', cn: '电话/微信', de: 'Telefon', fr: 'Téléphone', ja: '電話', kr: '전화' },
        },
        {
          name: 'cashmere_grade', type: 'select', required: true, fullWidth: true,
          label: {
            en: 'Cashmere Grade *', cn: '羊绒品类 *', de: 'Kaschmir-Sorte *',
            fr: 'Grade de cachemire *', ja: 'カシミア等級 *', kr: '캐시미어 등급 *',
          },
          options: {
            white: { en: 'White Cashmere (14.5-15.5μm)', cn: '白绒（14.5-15.5μm）', de: 'Weiß (14.5-15.5μm)', fr: 'Blanc (14.5-15.5μm)', ja: '白カシミア (14.5-15.5μm)', kr: '백색 (14.5-15.5μm)' },
            brown: { en: 'Brown Cashmere (15.5-16.5μm)', cn: '青绒（15.5-16.5μm）', de: 'Braun (15.5-16.5μm)', fr: 'Brun (15.5-16.5μm)', ja: '青カシミア (15.5-16.5μm)', kr: '청색 (15.5-16.5μm)' },
            purple: { en: 'Purple Cashmere', cn: '紫绒', de: 'Lila', fr: 'Violet', ja: '紫', kr: '자색' },
            mixed: { en: 'Mixed Grades', cn: '混合等级', de: 'Gemischte Sorten', fr: 'Grades mixtes', ja: '混合', kr: '혼합' },
          },
        },
        {
          name: 'quantity', required: true, fullWidth: true,
          label: { en: 'Quantity (kg) *', cn: '数量（kg）*', de: 'Menge (kg) *', fr: 'Quantité (kg) *', ja: '数量 (kg) *', kr: '수량 (kg) *' },
          placeholder: { en: 'e.g., 500kg', cn: '如：500kg', de: 'z.B. 500kg', fr: 'ex: 500kg', ja: '例: 500kg', kr: '예: 500kg' },
        },
        {
          name: 'fineness', fullWidth: true,
          label: { en: 'Preferred Fineness (μm)', cn: '细度要求（μm）', de: 'Feinheit (μm)', fr: 'Finesse (μm)', ja: '細度 (μm)', kr: '세밀도 (μm)' },
          placeholder: { en: 'e.g., 14.5-15.5μm', cn: '如：14.5-15.5μm', de: 'z.B. 14.5-15.5μm', fr: 'ex: 14.5-15.5μm', ja: '例: 14.5-15.5μm', kr: '예: 14.5-15.5μm' },
        },
        {
          name: 'message', type: 'textarea', fullWidth: true,
          label: { en: 'Additional Requirements', cn: '其他要求', de: 'Zusätzliche Anforderungen', fr: 'Exigences supplémentaires', ja: 'その他のご要望', kr: '추가 요구사항' },
        },
      ]}
    />
  );
}
