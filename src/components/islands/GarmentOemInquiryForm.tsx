/**
 * 成衣代工定制询盘表单（产品页专用）
 * Endpoint: POST /api/inquiry/garment
 */
import ProductInquiryForm from './ProductInquiryForm';

export default function GarmentOemInquiryForm({ locale }: { locale: string }) {
  return (
    <ProductInquiryForm
      locale={locale}
      productType="garment"
      endpoint="/api/inquiry/garment"
      title={{
        en: 'Garment OEM Custom Inquiry',
        cn: '成衣代工定制询盘',
        de: 'Bekleidung-OEM Anfrage',
        fr: 'Vêtement OEM - demande sur mesure',
        ja: '衣料OEMカスタム見積依頼',
        kr: '의류 OEM 맞춤 견적 문의',
      }}
      submitLabel={{
        en: 'Submit Custom Inquiry', cn: '提交定制询盘', de: 'Anfrage senden',
        fr: 'Envoyer', ja: '送信', kr: '문의 보내기',
      }}
      submittingLabel={{
        en: 'Submitting...', cn: '提交中...', de: 'Wird gesendet...',
        fr: 'Envoi...', ja: '送信中...', kr: '보내는 중...',
      }}
      successMsg={{
        en: 'Thank you! Our OEM team will contact you within 24 hours to discuss your custom order.',
        cn: '感谢！成衣代工团队将在24小时内联系您讨论定制订单。',
        de: 'Danke! Unser OEM-Team meldet sich innerhalb von 24 Stunden zur Besprechung Ihres Auftrags.',
        fr: 'Merci ! Notre équipe OEM vous contactera sous 24h pour discuter de votre commande.',
        ja: 'ありがとうございます！OEMチームが24時間以内にカスタムオーダーについてご連絡いたします。',
        kr: '감사합니다! OEM 팀이 24시간 이내에 맞춤 주문 관련하여 연락드리겠습니다.',
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
          label: { en: 'Brand / Company *', cn: '品牌/公司 *', de: 'Marke / Firma *', fr: 'Marque / Société *', ja: 'ブランド/会社 *', kr: '브랜드/회사 *' },
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
          name: 'garment_type', type: 'select', required: true, fullWidth: true,
          label: {
            en: 'Garment Type *', cn: '服装类型 *', de: 'Bekleidungstyp *',
            fr: 'Type de vêtement *', ja: '衣料タイプ *', kr: '의류 유형 *',
          },
        {
          name: 'material_preference',
          type: 'select',
          multiple: true,
          fullWidth: true,
          label: {
            en: 'Preferred Material',
            cn: '期望面料',
            de: 'Bevorzugtes Material',
            fr: 'Matériau préféré',
            ja: '希望素材',
            kr: '선호 소재',
          },
          options: {
            cashmere: { en: 'Cashmere', cn: '羊绒', de: 'Kaschmir', fr: 'Cachemire', ja: 'カシミア', kr: '캐시미어' },
            merino_wool: { en: 'Merino Wool', cn: '美利奴羊毛', de: 'Merinowolle', fr: 'Laine mérinos', ja: 'メリノウール', kr: '메리노 울' },
            cotton: { en: 'Cotton', cn: '棉', de: 'Baumwolle', fr: 'Coton', ja: 'コットン', kr: '면' },
            blend: { en: 'Wool/Cashmere Blend', cn: '毛绒混纺', de: 'Wolle/Kaschmir-Mischung', fr: 'Mélange laine/cachemire', ja: 'ウール/カシミア混紡', kr: '울/캐시미어 혼방' },
            sustainable: { en: 'Recycled / Sustainable', cn: '再生/环保面料', de: 'Recycelt / Nachhaltig', fr: 'Recyclé / Durable', ja: 'リサイクル/サステナブル', kr: '재활용/지속가능한 소재' },
            other: { en: 'Other (please specify in details)', cn: '其他（请在详情中说明）', de: 'Andere (bitte im Detail angeben)', fr: 'Autre (préciser dans les détails)', ja: 'その他（詳細に記載してください）', kr: '기타 (상세 내용에 기재해 주세요)',
          }
        },
          options: {
            sweater: { en: 'Sweater / Knitwear', cn: '羊绒衫/针织衫', de: 'Pullover / Strick', fr: 'Pull / Tricot', ja: 'セーター/ニット', kr: '스웨터/니트' },
            coat: { en: 'Cashmere Coat', cn: '羊绒大衣', de: 'Kaschmirmantel', fr: 'Manteau cachemire', ja: 'カシミアコート', kr: '캐시미어 코트' },
            scarf: { en: 'Scarf / Shawl', cn: '围巾/披肩', de: 'Schal / Tuch', fr: 'Écharpe / Châle', ja: 'スカーフ/ショール', kr: '스카프/숄' },
            hat: { en: 'Hat / Beanie', cn: '帽子/毛线帽', de: 'Mütze', fr: 'Bonnet', ja: '帽子/ビーニー', kr: '모자/비니' },
            other: { en: 'Other', cn: '其他', de: 'Andere', fr: 'Autre', ja: 'その他', kr: '기타' }
          },
        },
        {
          name: 'order_quantity', required: true, fullWidth: true,
          label: { en: 'Order Quantity (pcs) *', cn: '订单数量（件）*', de: 'Bestellmenge (Stk.) *', fr: 'Quantité (pcs) *', ja: '注文数量 (枚) *', kr: '주문 수량 (개) *' },
          placeholder: { en: 'e.g., 500pcs', cn: '如：500件', de: 'z.B. 500 Stk.', fr: 'ex: 500 pcs', ja: '例: 500枚', kr: '예: 500개' },
        },
        {
          name: 'target_price', fullWidth: true,
          label: { en: 'Target FOB Price (USD/pc)', cn: '目标 FOB 价（USD/件）', de: 'Ziel-FOB-Preis (USD/Stk.)', fr: 'Prix FOB cible (USD/pc)', ja: '目標 FOB 価格 (USD/枚)', kr: '목표 FOB 가격 (USD/개)' },
          placeholder: { en: 'e.g., $35/pc', cn: '如：$35/件', de: 'z.B. $35/Stk.', fr: 'ex: $35/pc', ja: '例: $35/枚', kr: '예: $35/개' },
        },
        {
          name: 'has_design', type: 'select', fullWidth: true,
          label: {
            en: 'Design Status', cn: '设计稿状态', de: 'Design-Status',
            fr: 'Statut du design', ja: 'デザイン状況', kr: '디자인 상태',
          },
          options: {
            techpack: { en: 'Ready tech pack', cn: '已有完整工艺单', de: 'Tech Pack vorhanden', fr: 'Tech pack prêt', ja: 'テックパックあり', kr: '테크팩 준비됨' },
            sketch: { en: 'Sketch only', cn: '仅有草图', de: 'Nur Skizze', fr: 'Croquis uniquement', ja: 'スケッチのみ', kr: '스케치만' },
            none: { en: 'Need design support', cn: '需要设计支持', de: 'Brauche Design-Unterstützung', fr: 'Besoin d\'aide design', ja: 'デザインサポート必要', kr: '디자인 지원 필요' },
          },
        },
        {
          name: 'message', type: 'textarea', fullWidth: true,
          label: { en: 'Project Details', cn: '项目详情', de: 'Projektdetails', fr: 'Détails du projet', ja: 'プロジェクト詳細', kr: '프로젝트 상세' },
        },
      ]}
    />
  );
}
