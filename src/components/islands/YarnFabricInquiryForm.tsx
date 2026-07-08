/**
 * 纱线/面料询盘表单（产品页专用）
 * Endpoint: POST /api/inquiry/yarn
 */
import ProductInquiryForm from './ProductInquiryForm';

export default function YarnFabricInquiryForm({ locale }: { locale: string }) {
  return (
    <ProductInquiryForm
      locale={locale}
      productType="yarn"
      endpoint="/api/inquiry/yarn"
      title={{
        en: 'Yarn & Fabric Inquiry',
        cn: '纱线/面料询盘',
        de: 'Garn & Stoff Anfrage',
        fr: 'Demande fil & tissu',
        ja: '糸・生地見積依頼',
        kr: '원사·직물 견적 문의',
      }}
      submitLabel={{
        en: 'Submit Inquiry', cn: '提交询盘', de: 'Anfrage senden',
        fr: 'Envoyer', ja: '送信', kr: '문의 보내기',
      }}
      submittingLabel={{
        en: 'Submitting...', cn: '提交中...', de: 'Wird gesendet...',
        fr: 'Envoi...', ja: '送信中...', kr: '보내는 중...',
      }}
      successMsg={{
        en: 'Thank you! Our yarn & fabric team will contact you within 24 hours.',
        cn: '感谢！纱线面料团队将在24小时内联系您。',
        de: 'Danke! Unser Garn-&-Stoff-Team meldet sich innerhalb von 24 Stunden.',
        fr: 'Merci ! Notre équipe fil & tissu vous contactera sous 24h.',
        ja: 'ありがとうございます！糸・生地チームが24時間以内にご連絡いたします。',
        kr: '감사합니다! 원사·직물 팀이 24시간 이내에 연락드리겠습니다.',
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
          name: 'delivery_date', type: 'date',
          label: { en: 'Required Delivery Date', cn: '期望交货日期', de: 'Wunschliefertermin', fr: 'Date de livraison souhaitee', ja: '希望納期', kr: '희망 납기일' },
        },
        {
          name: 'product_form', type: 'select', required: true, fullWidth: true,
          label: {
            en: 'Product Form *', cn: '产品形态 *', de: 'Produktform *',
            fr: 'Forme du produit *', ja: '製品形態 *', kr: '제품 형태 *',
          },
          options: {
            yarn: { en: 'Cashmere Yarn', cn: '羊绒纱线', de: 'Kaschmirgarn', fr: 'Fil de cachemire', ja: 'カシミア糸', kr: '캐시미어 원사' },
            woven: { en: 'Woven Fabric', cn: '梭织面料', de: 'Webstoff', fr: 'Tissage', ja: '織物', kr: '직물' },
            knit: { en: 'Knitted Fabric', cn: '针织面料', de: 'Maschenstoff', fr: 'Tricot', ja: 'ニット', kr: '니트' },
          },
        },
        {
          name: 'yarn_count', fullWidth: true,
          label: { en: 'Yarn Count / Fabric Spec', cn: '纱支/面料规格', de: 'Garn-Nr./Stoff-Spez.', fr: 'N° fil / spéc. tissu', ja: '番手/生地仕様', kr: '번수/원단 사양' },
          placeholder: {
            en: 'e.g., 2/26nm 100% cashmere',
            cn: '如：2/26nm 100%羊绒',
            de: 'z.B. 2/26nm 100% Kaschmir',
            fr: 'ex: 2/26nm 100% cachemire',
            ja: '例: 2/26nm 100%カシミア',
            kr: '예: 2/26nm 100% 캐시미어',
          },
        },
        {
          name: 'quantity', required: true, fullWidth: true,
          label: { en: 'Quantity *', cn: '数量 *', de: 'Menge *', fr: 'Quantité *', ja: '数量 *', kr: '수량 *' },
          placeholder: {
            en: 'e.g., 500kg yarn / 5000m fabric',
            cn: '如：500kg 纱 / 5000m 面料',
            de: 'z.B. 500kg Garn / 5000m Stoff',
            fr: 'ex: 500kg fil / 5000m tissu',
            ja: '例: 500kg 糸 / 5000m 生地',
            kr: '예: 500kg 원사 / 5000m 원단',
          },
        },
        {
          name: 'message', type: 'textarea', fullWidth: true,
          label: { en: 'Additional Requirements', cn: '其他要求', de: 'Zusätzliche Anforderungen', fr: 'Exigences supplémentaires', ja: 'その他のご要望', kr: '추가 요구사항' },
        },
      ]}
    />
  );
}
