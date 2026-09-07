/**
 * Vercel-to-Astro APIRoute adapter
 *
 * 背景:
 *   我们的服务端 endpoint 原本写成 Vercel Node API 风格:
 *     export default async function handler(req: VercelRequest, res: VercelResponse) {
 *       res.setHeader(...); res.status(200).json({...});
 *     }
 *   但是 Astro 5 + @astrojs/vercel 9.x 在 `output: 'server'` 模式下,只把
 *   `src/pages/api/*.ts` 编译成 SSR 路由,且只接受 Astro 的 APIRoute 形态:
 *     export const POST: APIRoute = async (context) => new Response(...)
 *
 *   Vercel 的 `api/` 顶层目录在 Astro adapter 下根本不被识别(adapter 只
 *   收集 src/pages/ 下的 entry points)。
 *
 * 做法:
 *   这个 shim 把 Astro `context.request` 包装成 Vercel 风格 `req`,把
 *   `res.setHeader / status / json / send / redirect / end` 映射到原生
 *   Web Response,让原 handler 代码几乎零改动就能跑在 Astro SSR 之上。
 *
 * 覆盖范围:
 *   - req.body (await context.request.json()) — POST/PUT 默认读, 其他方法读 raw
 *   - req.method (context.request.method)
 *   - req.headers (Object.fromEntries(headers))
 *   - req.socket.remoteAddress (context.clientAddress)
 *   - req.url (context.url.href)
 *   - req.query (parse URLSearchParams + context.params, 单值 string/多值 array)
 *   - res.setHeader / status / json / send / text / redirect / end
 *   - res.redirect(status?, path) — Vercel signature: redirect(res, status, path) 或 redirect(res, path)
 *
 * 已知差异:
 *   - req.body 是一次性消费的(stream);handler 不要既读 body 又访问
 *     context.request (会撞到)。
 *   - req.query 在 Astro 动态路由下不可用 (我们用 context.params 取)。
 *     Vercel-style catch-all 的 [...route] 我们用 URLSearchParams 模拟。
 */
import type { APIContext } from 'astro';

export interface VercelLikeRequest {
  method: string;
  body: any;
  headers: Record<string, string | string[] | undefined>;
  socket: { remoteAddress: string };
  url: string;
  query: Record<string, string | string[] | undefined>;
}

export interface VercelLikeResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any; // 当 end() 时使用
  ended: boolean;
  redirected: { status: number; location: string } | null;
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => VercelLikeResponse;
  json: (obj: any) => void;
  text: (str: string) => void;
  send: (body: any) => void;
  redirect: (statusOrPath: number | string, pathArg?: string) => VercelLikeResponse;
  end: (body?: any) => void;
}

export type VercelHandler = (
  req: VercelLikeRequest,
  res: VercelLikeResponse,
) => void | Promise<void>;

/**
 * 把 query string (Vercel-style) 解析成 Vercel 风格的 query 对象
 * 单值 string, 多值 array。
 */
function parseQuery(url: URL): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};
  for (const [k, v] of url.searchParams) {
    if (k in out) {
      const existing = out[k];
      out[k] = Array.isArray(existing) ? [...existing, v] : [existing as string, v];
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * 把 Vercel-style handler 包成 Astro APIRoute。
 *
 * 使用方式:
 *   import { toAstroApiRoute } from '@/lib/api/vercel-shim';
 *
 *   const handler: VercelHandler = async (req, res) => {
 *     if (req.method !== 'POST') return res.status(405).json({error:'method'});
 *     res.status(200).json({ok: true});
 *   };
 *
 *   export const prerender = false;
 *   export const POST = toAstroApiRoute(handler);
 *   export const OPTIONS = toAstroApiRoute(handler);
 */
export function toAstroApiRoute(handler: VercelHandler) {
  return async (context: APIContext): Promise<Response> => {
    // 构建 Vercel-like req
    const headersObj: Record<string, string | string[] | undefined> = {};
    context.request.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    // 安全读取 body。Vercel 默认 body={};handler 自己判断
    // 支持 application/json 和 application/x-www-form-urlencoded
    let body: any = {};
    try {
      const ct = context.request.headers.get('content-type') || '';
      if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
        if (ct.includes('application/json')) {
          body = await context.request.json().catch(() => ({}));
        } else if (ct.includes('application/x-www-form-urlencoded')) {
          const raw = await context.request.text().catch(() => '');
          if (raw) {
            const params = new URLSearchParams(raw);
            const obj: Record<string, string> = {};
            for (const [k, v] of params) obj[k] = v;
            body = obj;
          }
        }
        // multipart/form-data 和 raw:handler 自己用 context.request.formData()
      }
    } catch {
      body = {};
    }

    const req: VercelLikeRequest = {
      method: context.request.method,
      body,
      headers: headersObj,
      socket: { remoteAddress: context.clientAddress || 'unknown' },
      url: context.url.href,
      query: { ...parseQuery(context.url), ...(context.params || {}) },
    };

    // 构建 Vercel-like res
    const res: VercelLikeResponse = {
      statusCode: 200,
      headers: {},
      body: undefined,
      ended: false,
      redirected: null,
      setHeader(name, value) {
        this.headers[name] = Array.isArray(value) ? value.join(',') : String(value);
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(obj) {
        this.body = JSON.stringify(obj);
        this.headers['content-type'] = this.headers['content-type'] || 'application/json';
        this.ended = true;
      },
      text(str) {
        this.body = str;
        this.headers['content-type'] = this.headers['content-type'] || 'text/plain';
        this.ended = true;
      },
      send(b) {
        this.body = b;
        this.ended = true;
      },
      redirect(statusOrPath, pathArg) {
        // Vercel signature: redirect(res, status, path) OR redirect(res, path)
        let status: number;
        let path: string;
        if (typeof statusOrPath === 'number') {
          status = statusOrPath;
          path = String(pathArg || '/');
        } else {
          status = 302;
          path = String(statusOrPath);
        }
        this.headers['Location'] = path;
        this.redirected = { status, location: path };
        this.statusCode = status;
        this.ended = true;
        return this;
      },
      end(b) {
        if (b !== undefined) this.body = b;
        this.ended = true;
      },
    };

    await handler(req, res);

    if (!res.ended) {
      // handler 忘记 end(), 兜底
      res.end();
    }

    return new Response(res.body, {
      status: res.statusCode,
      headers: res.headers,
    });
  };
}

/**
 * 简易 OPTIONS/CORS 预检 shim。
 * 如果 endpoint 自己的 handler 想接管 OPTIONS (比如带 Auth 的 preflight),
 * 它可以在自己的 handler 里处理;否则用这个默认。
 */
export function corsPreflightHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Hermes-Token',
    'Access-Control-Max-Age': '86400',
  };
}