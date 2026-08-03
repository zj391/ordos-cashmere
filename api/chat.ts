/**
 * /api/chat  —  AI 24h 智能客服 endpoint
 *
 * Provider-agnostic: OpenAI-compatible (OpenRouter / DeepSeek / Manus Forge / OpenAI)
 * or Gemini. Auto-detected by LLM_API_URL value.
 *
 * Inputs:  POST { messages: [{role, content}], locale?, email?, company? }
 * Output:  { success, reply, model, usage? }
 *
 * Standalone Vercel Node API (NOT Astro APIContext) so it lives in api/ as
 * its own function and is not subject to Astro 5.18 + @astrojs/vercel 9.0.5
 * endpoint-dispatch bugs that affect src/pages/api/* endpoints.
 *
 * Env: LLM_API_URL, LLM_API_KEY, LLM_MODEL, SUPABASE_URL, SUPABASE_SERVICE_KEY
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}


function getEnv(name: string, fallback?: string): string {
  return process.env[name] || process.env[name.toLowerCase()] || (fallback ?? '');
}

// Gemini has two endpoints:
//   1. Legacy: https://generativelanguage.googleapis.com/v1beta  → /models/{m}:generateContent?key=...
//   2. OpenAI-compatible: https://generativelanguage.googleapis.com/v1beta/openai  → /chat/completions
// The OpenAI-compat URL ends in `/openai`; the legacy URL contains `v1beta` but NOT `openai`.
// Auto-detect: if URL ends with `/openai`, use OpenAI-compat. Otherwise if URL contains
// 'googleapis' or 'gemini', use the legacy Gemini format. Otherwise default to OpenAI.
const LLM_API_URL_RAW = getEnv('LLM_API_URL', '');
const LLM_API_URL = LLM_API_URL_RAW || 'https://openrouter.ai/api/v1';
const LLM_USES_OPENAI_COMPAT = LLM_API_URL.endsWith('/openai') || !/(googleapis|gemini)/.test(LLM_API_URL);
const LLM_PROVIDER = LLM_USES_OPENAI_COMPAT ? 'openai' : 'gemini';
const LLM_API_KEY = getEnv('LLM_API_KEY', getEnv('DEEPSEEK_KEY', ''));
const LLM_MODEL = getEnv('LLM_MODEL', 'meta-llama/llama-3.1-8b-instruct:free');
const SITE_NAME = getEnv('SITE_NAME', 'DONGXIAO Cashmere');
const SITE_DOMAIN = getEnv('SITE_DOMAIN', 'erdosdx.com');

const SYSTEM_PROMPTS: Record<string, string> = {
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

// Optional injected knowledge (loaded from src/data/chat-knowledge if present).
// Inlined here as an empty fallback so the function is self-contained.
const KNOWLEDGE_FALLBACK: Record<string, string> = {
  en: '',
  cn: '',
  de: '',
  fr: '',
  ja: '',
  kr: '',
};
function buildKnowledgeSection(locale: string): string {
  return KNOWLEDGE_FALLBACK[locale] || '';
}

function convertToGemini(messages: Array<{ role: string; content: string }>, systemInstruction: string) {
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  let systemText = systemInstruction;
  for (const m of messages) {
    if (m.role === 'system') systemText += '\n\n' + m.content;
    else contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] });
  }
  return {
    systemInstruction: { parts: [{ text: systemText }] },
    contents,
    generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
  };
}
function extractGeminiReply(data: any): string {
  const cand = data?.candidates?.[0];
  return cand?.content?.parts?.map((p: any) => p.text || '').join('') || '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  if (!LLM_API_KEY) {
    // Diagnostics: log which env keys are present so we can debug Vercel casing.
    const envKeys = Object.keys(process.env).filter((k) =>
      /llm|deepseek|gemini|openai/i.test(k),
    );
    console.error('[chat] LLM_API_KEY not found. Relevant env keys present:', envKeys);
    return res.status(503).json({
      success: false,
      error: 'llm_not_configured',
      message: 'Chat service not configured. Set LLM_API_KEY in Vercel env.',
      debug: { env_keys_seen: envKeys },
    });
  }

  try {
    const body = (req.body || {}) as {
      messages?: Array<{ role: string; content: string }>;
      locale?: string;
      email?: string;
      company?: string;
    };
    const messages = body.messages || [];
    const locale = body.locale || 'en';

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'messages_required' });
    }

    let sysPrompt = SYSTEM_PROMPTS[locale] || SYSTEM_PROMPTS.en;
    sysPrompt = sysPrompt + '\n\n' + buildKnowledgeSection(locale);

    // Known customer lookup (Supabase)
    const supabaseUrl = getEnv('SUPABASE_URL', getEnv('PUBLIC_SUPABASE_URL', ''));
    const supabaseKey = getEnv('SUPABASE_SERVICE_KEY', '');
    if (body.email && supabaseUrl && supabaseKey) {
      try {
        const lookup = await fetch(
          `${supabaseUrl}/rest/v1/known_customers?contact_email=eq.${encodeURIComponent(body.email)}&select=grade,company_name,contact_name,lifetime_value_usd,total_orders,total_inquiries,tags,notes&limit=1`,
          { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } },
        );
        if (lookup.ok) {
          const rows = await lookup.json();
          if (Array.isArray(rows) && rows.length > 0) {
            const k = rows[0];
            const ctx = [
              '[Known customer profile] You are chatting with an existing customer:',
              `Company: ${k.company_name || '-'}${body.company && body.company !== k.company_name ? ` (this session they said "${body.company}" — please verify politely)` : ''}`,
              `Contact: ${k.contact_name || '-'}`,
              `Grade: ${k.grade || 'ungraded'}`,
              `History: ${k.total_orders ?? 0} orders / USD ${(k.lifetime_value_usd ?? 0).toLocaleString()}`,
              `Tags: ${(k.tags || []).join(', ') || '-'}`,
              k.notes ? `Notes: ${k.notes}` : '',
            ]
              .filter(Boolean)
              .join('\n');
            sysPrompt = sysPrompt + '\n\n' + ctx;
          }
        }
      } catch {
        /* silent */
      }
    }

    const trimmed = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
    let url: string;
    let fetchOptions: RequestInit;
    if (LLM_PROVIDER === 'gemini') {
      const body2 = convertToGemini(trimmed, sysPrompt);
      url = `${LLM_API_URL}/models/${LLM_MODEL}:generateContent?key=${LLM_API_KEY}`;
      fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body2),
      };
    } else {
      url = `${LLM_API_URL}/chat/completions`;
      fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages: [{ role: 'system', content: sysPrompt }, ...trimmed],
          temperature: 0.4,
          max_tokens: 600,
        }),
      };
    }

    const upstream = await fetch(url, fetchOptions);
    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      return res.status(502).json({
        success: false,
        error: 'upstream_failed',
        status: upstream.status,
        message: errText.slice(0, 500),
      });
    }

    const data = await upstream.json();
    const reply = LLM_PROVIDER === 'gemini' ? extractGeminiReply(data) : data?.choices?.[0]?.message?.content || '';

    return res.status(200).json({
      success: true,
      reply,
      model: LLM_MODEL,
      usage: data?.usageMetadata,
    });
  } catch (e: any) {
    return res.status(500).json({
      success: false,
      error: 'internal_error',
      message: e?.message || 'Unknown error',
    });
  }
}
