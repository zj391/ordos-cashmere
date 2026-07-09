/**
 * GSC OAuth Token Broker — Cloudflare Worker
 *
 * 解决 WSL/受限环境无法直连 Google API 的问题。
 *
 * 部署步骤:
 *   1. 安装 wrangler: npm install -g wrangler
 *   2. 登录: wrangler login
 *   3. 在 Cloudflare Dashboard 创建 KV namespace: GSC_KV (随便 ID)
 *   4. 修改下面的 wrangler.toml + 部署: wrangler deploy
 *   5. 配 Secrets: wrangler secret put GSC_PRIVATE_KEY
 *                 (粘贴 service account JSON 中的 private_key 字段)
 *      wrangler secret put GSC_CLIENT_EMAIL
 *                 (粘贴 service account email)
 *   6. 调用: curl https://gsc-broker.你的子域名.workers.dev/token
 *      返回 1 小时有效 access token
 *
 * Worker 端点:
 *   GET  /token         - 返回 fresh access token (JSON: {token, expiresAt})
 *   GET  /sitemap       - 调用 GSC listSitemaps (验证 broker 工作)
 *   POST /submit        - 提交 sitemap (body: {sitemapUrl})
 */
export interface Env {
  GSC_PRIVATE_KEY: string;   // -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
  GSC_CLIENT_EMAIL: string;   // xxx@project.iam.gserviceaccount.com
  GSC_KV?: KVNamespace;       // optional: 用于缓存 token
}

const SCOPES = ['https://www.googleapis.com/auth/webmasters'];
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GSC_BASE = 'https://www.googleapis.com/webmasters/v3';

function base64UrlEncode(input: ArrayBuffer | string): string {
  const bytes = typeof input === 'string'
    ? new TextEncoder().encode(input)
    : new Uint8Array(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Import a PEM-encoded private key into a CryptoKey for signing.
// Supports RSA keys (the only type Google service accounts use).
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  // Strip the PEM header/footer and decode base64
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    'pkcs8',
    binary.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function createSignedJwt(privateKey: CryptoKey, clientEmail: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientEmail,
    scope: SCOPES.join(' '),
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600, // 1 hour
  };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${headerB64}.${payloadB64}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${base64UrlEncode(signature)}`;
}

async function getAccessToken(env: Env): Promise<{ token: string; expiresAt: number }> {
  // Try cache
  if (env.GSC_KV) {
    const cached = await env.GSC_KV.get('access_token');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.expiresAt > Date.now() + 60_000) return parsed;
    }
  }
  // Mint fresh
  const key = await importPrivateKey(env.GSC_PRIVATE_KEY);
  const jwt = await createSignedJwt(key, env.GSC_CLIENT_EMAIL);
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token mint failed: ${res.status} ${text}`);
  }
  const data: any = await res.json();
  const expiresAt = Date.now() + (data.expires_in - 60) * 1000;
  const result = { token: data.access_token, expiresAt };
  if (env.GSC_KV) {
    await env.GSC_KV.put('access_token', JSON.stringify(result), { expirationTtl: 3500 });
  }
  return result;
}

async function handleToken(env: Env): Promise<Response> {
  try {
    const t = await getAccessToken(env);
    return new Response(JSON.stringify(t), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

async function handleList(env: Env, siteUrl = 'sc-domain:erdosdx.com'): Promise<Response> {
  const t = await getAccessToken(env);
  const res = await fetch(`${GSC_BASE}/sites/${encodeURIComponent(siteUrl)}/sitemaps`, {
    headers: { 'Authorization': `Bearer ${t.token}` },
  });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleSubmit(env: Env, request: Request): Promise<Response> {
  const body: any = await request.json();
  const feedUrl = body.sitemapUrl || 'https://www.erdosdx.com/sitemap-index.xml';
  const siteUrl = body.siteUrl || 'sc-domain:erdosdx.com';
  const t = await getAccessToken(env);
  const res = await fetch(
    `${GSC_BASE}/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedUrl)}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${t.token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  const respBody = await res.text();
  return new Response(respBody, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === '/token') return handleToken(env);
    if (path === '/sitemap' || path === '/list') return handleList(env);
    if (path === '/submit' && request.method === 'POST') return handleSubmit(env, request);
    if (path === '/' || path === '/help') {
      return new Response(JSON.stringify({
        endpoints: {
          'GET /token': 'Returns a fresh GSC access token (JSON {token, expiresAt})',
          'GET /sitemap': 'List current sitemaps for the configured property',
          'POST /submit': 'Submit a sitemap. Body: {sitemapUrl?, siteUrl?}',
        },
      }, null, 2), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('Not Found', { status: 404 });
  },
};