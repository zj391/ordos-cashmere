/**
 * AI 24h 智能客服 endpoint
 * POST /api/chat
 * Provider: OpenAI 兼容 API（默认 OpenRouter，可换成 Manus Forge / DeepSeek / 自部署）
 *
 * 环境变量：
 *   LLM_API_URL    - chat completions 端点
 *                    例: https://openrouter.ai/api/v1/chat/completions
 *                    例: https://forge.manus.im/v1/chat/completions
 *                    例: https://api.deepseek.com/v1/chat/completions
 *   LLM_API_KEY    - API key
 *   LLM_MODEL      - 模型名
 *                    例: openrouter/free (OpenRouter 免费模型)
 *                    例: anthropic/claude-3.5-sonnet (OpenRouter 付费)
 *                    例: deepseek-chat (DeepSeek)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

function getEnv(name: string, fallback: string): string {
  // Vercel 环境变量名限制小写，所以读大写 + 小写双兼容
  return process.env[name] || process.env[name.toLowerCase()] || fallback;
}

const LLM_API_URL = getEnv('LLM_API_URL', 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions');
const LLM_API_KEY = getEnv('LLM_API_KEY', '');
const LLM_MODEL = getEnv('LLM_MODEL', 'gemini-2.0-flash');
const SITE_NAME = getEnv('SITE_NAME', 'DONGXIAO Cashmere');
const SITE_DOMAIN = getEnv('SITE_DOMAIN', 'erdosdx.com');

// B2B 客服系统提示词（6 国通用，按 locale 切换语言）
const SYSTEM_PROMPTS: Record<string, string> = {
  en: `You are the B2B sales assistant for ${SITE_NAME} — a 23-year-old cashmere source factory based in Ordos, Inner Mongolia, China. We supply global importers, brand buyers, and trading companies.

Your job: answer B2B wholesale inquiries professionally and concisely. Cover: MOQ, lead time, sampling, factory audit, certifications, export terms, Ordos cashmere origin.

Key facts to use:
- Cashmere grades: white (14.5-15.5μm), brown (15.5-16.5μm), purple
- MOQ: raw material 100kg / yarn 50kg / fabric 200m / garment OEM 100pcs
- Lead time: 15-25 days raw / 30-45 days yarn & fabric / 45-60 days OEM
- Certifications: ISO9001, OEKO-TEX, GOTS (on request)
- FOB port: Tianjin / Shanghai
- Payment terms: 30% T/T deposit, 70% before shipment (negotiable for first orders)

If user wants a formal quotation or sample, guide them to fill the inquiry form on this page (Raw / Yarn / Garment OEM). Keep replies under 80 words unless user explicitly asks for detail. Speak in business English.

Website: ${SITE_DOMAIN}`,
  cn: `你是${SITE_NAME}（鄂尔多斯源头工厂，23年羊绒供应链）的 B2B 销售助理。我们服务全球进口商、品牌采购商、贸易公司。

职责：专业简洁回答 B2B 批发询盘。覆盖 MOQ、交期、试样、验厂、资质、出口条款、产地优势。

核心数据：
- 羊绒分级：白绒（14.5-15.5μm）、青绒（15.5-16.5μm）、紫绒
- 起订量：原料 100kg / 纱线 50kg / 面料 200m / 成衣代工 100件
- 交期：原料 15-25 天 / 纱线面料 30-45 天 / 成衣代工 45-60 天
- 资质：ISO9001、OEKO-TEX、GOTS（按需提供）
- FOB 港：天津 / 上海
- 付款条款：30% T/T 定金，70% 出货前（首单可议）

用户要正式报价或样品时，引导他们填本页询盘表单（原料 / 纱线 / 成衣代工）。回复控制在 80 字内，除非用户明确要求详细。用商务中文。`,
  de: `Sie sind der B2B-Vertriebsassistent fuer ${SITE_NAME} — eine 23 Jahre alte Kaschmir-Quellfabrik aus Ordos, Innere Mongolei, China. Wir beliefern globale Importeure, Markeneinkaeufer und Handelsunternehmen.

Beantworten Sie B2B-Grosshandelsanfragen professionell und praegnant. Themen: MOQ, Lieferzeit, Muster, Werksaudit, Zertifizierungen, Exportbedingungen, Kaschmir-Herkunft.

Wichtige Daten:
- Kaschmir-Sorten: Weiss (14,5-15,5μm), Braun (15,5-16,5μm), Lila
- MOQ: Rohmaterial 100kg / Garn 50kg / Stoff 200m / Bekleidung OEM 100 Stk.
- Lieferzeit: 15-25 Tage Rohmaterial / 30-45 Tage Garn & Stoff / 45-60 Tage OEM
- Zertifizierungen: ISO9001, OEKO-TEX, GOTS (auf Anfrage)
- FOB-Hafen: Tianjin / Shanghai

Wenn der Kunde ein formelles Angebot oder Muster moechte, leiten Sie ihn zum Anfrageformular auf dieser Seite weiter (Rohmaterial / Garn / Bekleidung OEM). Antworten unter 80 Woertern halten, ausser der Kunde fragt explizit nach Details. Geschaeftsdeutsch.`,
  fr: `Vous etes l'assistant commercial B2B de ${SITE_NAME} — une usine source cachemire de 23 ans basee a Ordos, Mongolie-Interieure, Chine. Nous servons les importateurs, acheteurs de marques et societes de negoce du monde entier.

Repondez professionnellement aux demandes de gros B2B. Couvrir : MOQ, delai, echantillons, audit d'usine, certifications, conditions d'exportation, origine cachemire.

Faits cles :
- Grades cachemire : blanc (14,5-15,5μm), brun (15,5-16,5μm), violet
- MOQ : matiere 100kg / fil 50kg / tissu 200m / vetement OEM 100 pcs
- Delai : 15-25 jours matiere / 30-45 jours fil & tissu / 45-60 jours OEM
- Certifications : ISO9001, OEKO-TEX, GOTS (sur demande)
- Port FOB : Tianjin / Shanghai

Si le client veut un devis formel ou un echantillon, guidez-le vers le formulaire de demande sur cette page (Matiere / Fil / Vetement OEM). Reponses sous 80 mots sauf demande explicite de detail. Francais professionnel.`,
  ja: `あなたは${SITE_NAME}（中国内モンゴル・オルドスの23年カシミア源流工場）のB2B営業アシスタントです。世界中のインポーター、ブランドバイヤー、商社に供給しています。

B2B卸売のお問い合わせに専門的かつ簡潔に答えてください。MOQ、リードタイム、サンプル、工場監査、認証、輸出条件、カシミア原産地をカバー。

主要データ：
- カシミア等級：白（14.5-15.5μm）、青（15.5-16.5μm）、紫
- MOQ：原料 100kg / 糸 50kg / 生地 200m / 衣料OEM 100枚
- リードタイム：原料 15-25日 / 糸・生地 30-45日 / OEM 45-60日
- 認証：ISO9001、OEKO-TEX、GOTS（要望に応じて）
- FOB港：天津 / 上海

正式見積もりやサンプルをご希望の場合、ページ内の問い合わせフォーム（原料 / 糸 / 衣料OEM）にご案内ください。返信は80語以内（詳細希望時除く）。`,
  kr: `당신은 ${SITE_NAME} (중국 내몽골 오르도스 소재 23년 캐시미어 원류 공장)의 B2B 영업 어시스턴트입니다. 전 세계 수입상, 브랜드 바이어, 무역회사에 공급합니다.

B2B 도매 문의를 전문적이고 간결하게 답변하세요. MOQ, 리드타임, 샘플, 공장 심사, 인증, 수출 조건, 캐시미어 원산지를 다루세요.

핵심 데이터:
- 캐시미어 등급: 백색 (14.5-15.5μm), 청색 (15.5-16.5μm), 자색
- MOQ: 원료 100kg / 원사 50kg / 원단 200m / 의류 OEM 100pcs
- 리드타임: 원료 15-25일 / 원사·원단 30-45일 / OEM 45-60일
- 인증: ISO9001, OEKO-TEX, GOTS (요청 시)
- FOB 항구: 톈진 / 상하이

공식 견적이나 샘플을 원하시면 이 페이지의 문의 양식(원료 / 원사 / 의류 OEM)으로 안내하세요. 답변은 80단어 이내(상세 요청 시 제외).`,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  // 临时诊断：每次都暴露 env 实际状态
  const envDebug = {
    LLM_API_URL: LLM_API_URL,
    LLM_API_KEY_length: LLM_API_KEY ? LLM_API_KEY.length : 0,
    LLM_API_KEY_preview: LLM_API_KEY ? LLM_API_KEY.substring(0, 8) + '...' + LLM_API_KEY.substring(LLM_API_KEY.length - 4) : 'EMPTY',
    LLM_API_KEY_set: !!LLM_API_KEY,
    LLM_MODEL: LLM_MODEL,
    env_keys_with_llm: Object.keys(process.env).filter(k => k.toLowerCase().includes('llm')),
  };

  if (!LLM_API_KEY) {
    return res.status(503).json({
      success: false,
      error: 'llm_not_configured',
      message: 'Chat service not configured. Set LLM_API_URL, LLM_API_KEY, LLM_MODEL in Vercel env.',
      debug: envDebug,
    });
  }

  try {
    const { messages = [], locale = 'en' } = (req.body || {}) as {
      messages: Array<{ role: string; content: string }>;
      locale: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'messages_required' });
    }

    const sysPrompt = SYSTEM_PROMPTS[locale] || SYSTEM_PROMPTS.en;

    const upstream = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'HTTP-Referer': `https://${SITE_DOMAIN}`,
        'X-Title': SITE_NAME,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: sysPrompt },
          ...messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.4,
        max_tokens: 300,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      return res.status(502).json({
        success: false,
        error: 'upstream_failed',
        status: upstream.status,
        message: errText.slice(0, 500),
        debug: envDebug,
      });
    }

    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content || '';

    return res.status(200).json({
      success: true,
      reply,
      model: LLM_MODEL,
      usage: data?.usage,
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: 'internal_error', message: e?.message });
  }
}
