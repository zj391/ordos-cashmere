/**
 * AI 24h 智能客服 endpoint (Astro 5 SSR)
 * POST /api/chat
 * Provider: OpenAI 兼容 API (DeepSeek / OpenRouter / Manus Forge 任一)
 *
 * Environment variables (set in Vercel project settings):
 *   LLM_API_URL    - chat completions endpoint
 *                    e.g. https://api.deepseek.com/v1/chat/completions
 *                    e.g. https://openrouter.ai/api/v1/chat/completions
 *   LLM_API_KEY    - API key
 *   LLM_MODEL      - model name
 *                    e.g. deepseek-chat
 *                    e.g. anthropic/claude-3.5-sonnet
 */
import { buildKnowledgeSection } from '../../data/chat-knowledge';

function getEnv(name, fallback) {
  return process.env[name] || process.env[name.toLowerCase()] || fallback;
}

const LLM_API_URL = getEnv('LLM_API_URL', 'https://api.deepseek.com/v1/chat/completions');
const LLM_API_KEY = getEnv('DEEPSEEK_KEY', getEnv('LLM_API_KEY', ''));
const LLM_MODEL = getEnv('LLM_MODEL', 'deepseek-chat');
const SITE_NAME = getEnv('SITE_NAME', 'DONGXIAO Cashmere');
const SITE_DOMAIN = getEnv('SITE_DOMAIN', 'erdosdx.com');

const SYSTEM_PROMPTS = {
  en: `You are the B2B sales assistant for ${SITE_NAME} — a 23-year-old cashmere source factory based in Ordos, Inner Mongolia, China. We supply global importers, brand buyers, and trading companies.

Your job: answer B2B wholesale inquiries professionally and concisely. Cover: MOQ, lead time, sampling, factory audit, certifications, export terms, Ordos cashmere origin, all 6 product lines.

If user wants a formal quotation or sample, guide them to fill the inquiry form on this page (Raw / Yarn / Garment OEM). Keep replies under 120 words unless user explicitly asks for detail. Speak in business English.

Website: ${SITE_DOMAIN}`,

  cn: `你是${SITE_NAME}（鄂尔多斯源头工厂，23年羊绒供应链）的 B2B 销售助理。我们服务全球进口商、品牌采购商、贸易公司。

职责：专业简洁回答 B2B 批发询盘。覆盖 MOQ、交期、试样、验厂、资质、出口条款、产地优势、6 大产品线。

用户要正式报价或样品时，引导他们填本页询盘表单（原料 / 纱线 / 成衣代工）。回复控制在 120 字内，除非用户明确要求详细。用商务中文。`,

  de: `Sie sind der B2B-Vertriebsassistent fuer ${SITE_NAME} — eine 23 Jahre alte Kaschmir-Quellfabrik aus Ordos, Innere Mongolei, China. Wir beliefern globale Importeure, Markeneinkaeufer und Handelsunternehmen.

Beantworten Sie B2B-Grosshandelsanfragen professionell und praegnant. Themen: MOQ, Lieferzeit, Muster, Werksaudit, Zertifizierungen, Exportbedingungen, Kaschmir-Herkunft, alle 6 Produktlinien.

Wenn der Kunde ein formelles Angebot oder Muster moechte, leiten Sie ihn zum Anfrageformular auf dieser Seite weiter. Antworten unter 120 Woertern halten, ausser der Kunde fragt explizit nach Details. Geschaeftsdeutsch.`,

  fr: `Vous etes l'assistant commercial B2B de ${SITE_NAME} — une usine source cachemire de 23 ans basee a Ordos, Mongolie-Interieure, Chine. Nous servons les importateurs, acheteurs de marques et societes de negoce du monde entier.

Repondez professionnellement aux demandes de gros B2B. Couvrir : MOQ, delai, echantillons, audit d'usine, certifications, conditions d'exportation, origine cachemire, les 6 gammes de produits.

Si le client veut un devis formel ou un echantillon, guidez-le vers le formulaire de demande sur cette page. Reponses sous 120 mots sauf demande explicite de detail. Francais professionnel.`,

  ja: `あなたは${SITE_NAME}（中国内モンゴル・オルドスの23年カシミア源流工場）のB2B営業アシスタントです。世界中のインポーター、ブランドバイヤー、商社に供給しています。

B2B卸売のお問い合わせに専門的かつ簡潔に答えてください。MOQ、リードタイム、サンプル、工場監査、認証、輸出条件、カシミア原産地、6 つの製品ライン。

正式見積もりやサンプルをご希望の場合、ページ内の問い合わせフォームにご案内ください。返信は 120 語以内（詳細希望時除く）。`,

  kr: `당신은 ${SITE_NAME} (중국 내몽골 오르도스 소재 23년 캐시미어 원류 공장)의 B2B 영업 어시스턴트입니다. 전 세계 수입상, 브랜드 바이어, 무역회사에 공급합니다.

B2B 도매 문의를 전문적이고 간결하게 답변하세요. MOQ, 리드타임, 샘플, 공장 심사, 인증, 수출 조건, 캐시미어 원산지, 6개 제품 라인.

공식 견적이나 샘플을 원하시면 이 페이지의 문의 양식으로 안내하세요. 답변은 120단어 이내(상세 요청 시 제외).`,
};

export const POST = async ({ request }) => {
  // CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (!LLM_API_KEY) {
    return new Response(JSON.stringify({
      success: false,
      error: 'llm_not_configured',
      message: 'Chat service not configured.',
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages = [], locale = 'en', email, company } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'messages_required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    let sysPrompt = SYSTEM_PROMPTS[locale] || SYSTEM_PROMPTS.en;
    // Append structured product/FAQ knowledge base for grounded answers.
    sysPrompt = sysPrompt + '\n\n' + buildKnowledgeSection(locale);

    // Known customer lookup (Supabase)
    const supabaseUrl = getEnv('SUPABASE_URL', getEnv('PUBLIC_SUPABASE_URL', ''));
    const supabaseKey = getEnv('SUPABASE_SERVICE_KEY', '');
    if (email && supabaseUrl && supabaseKey) {
      try {
        const lookup = await fetch(
          `${supabaseUrl}/rest/v1/known_customers?contact_email=eq.${encodeURIComponent(email)}&select=grade,company_name,contact_name,lifetime_value_usd,total_orders,total_inquiries,tags,notes&limit=1`,
          { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
        );
        if (lookup.ok) {
          const rows = await lookup.json();
          if (rows.length > 0) {
            const k = rows[0];
            const ctx = [
              '[已知客户档案] 您正在与以下已建档客户沟通：',
              `公司：${k.company_name || '-'}${company && company !== k.company_name ? `（本次填写的公司名："${company}"与档案不一致，请礼貌核实）` : ''}`,
              `联系人：${k.contact_name || '-'}`,
              `客户等级：${k.grade || '未分级'}`,
              `历史成交：${k.total_orders ?? 0} 笔 / 累计 USD ${(k.lifetime_value_usd ?? 0).toLocaleString()}`,
              `标签：${(k.tags || []).join(', ') || '-'}`,
              k.notes ? `备注：${k.notes}` : '',
            ].filter(Boolean).join('\n');
            sysPrompt = sysPrompt + '\n\n' + ctx;
          }
        }
      } catch (e) { /* silent */ }
    }

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
        max_tokens: 600,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      return new Response(JSON.stringify({
        success: false,
        error: 'upstream_failed',
        status: upstream.status,
        message: errText.slice(0, 500),
      }), {
        status: 502, headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({
      success: true,
      reply,
      model: LLM_MODEL,
      usage: data?.usage,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: 'internal_error',
      message: e?.message || 'Unknown error',
    }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const GET = async () => {
  return new Response(JSON.stringify({ success: false, error: 'method_not_allowed' }), {
    status: 405, headers: { 'Content-Type': 'application/json' },
  });
};