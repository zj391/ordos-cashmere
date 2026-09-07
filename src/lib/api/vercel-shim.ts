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
 *   `res.setHeader / status / json / send` 映射到原生 Web Response,
 *   让原 handler 代码几乎零改动就能跑在 Astro SSR 之上。
 *
 * 覆盖范围:
 *   - req.body (await context.request.json())
 *   - req.method (context.request.method)
 *   - req.headers (Object.fromEntries(headers))
 *   - req.socket.remoteAddress (context.clientAddress)
 *   - req.url (context.url.href)
 *   - res.setHeader(k, v) / res.status(n) / res.json(o) / res.send(s) / res.text(s)
 *   - res.end() 终结响应
 *
 * 已知差异:
 *   - req.body 是一次性消费的(stream);如 handler 既读 body 又访问
 *     context.request,请避免,直接读 shim 的 req.body。
 */
import type { APIContext } from 'astro';

export interface VercelLikeRequest {
  method: string;
  body: any;
  headers: Record<string, string | string[] | undefined>;
  socket: { remoteAddress: string };
  url: string;
}

export interface VercelLikeResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any; // 当 end() 时使用
  ended: boolean;
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => VercelLikeResponse;
  json: (obj: any) => void;
  text: (str: string) => void;
  send: (body: any) => void;
  end: (body?: any) => void;
}

export type VercelHandler = (
  req: VercelLikeRequest,
  res: VercelLikeResponse,
) => void | Promise<void>;

/**
 * 把 Vercel-style handler 包成 Astro APIRoute。
 *
 * 使用方式:
 *   import type { VercelHandler } from '@/lib/api/vercel-shim';
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

    // 安全读取 body (避免空 body 抛 JSON 解析错)
    let body: any = {};
    try {
      const ct = context.request.headers.get('content-type') || '';
      if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
        if (ct.includes('application/json')) {
          body = await context.request.json().catch(() => ({}));
        } else {
          body = {};
        }
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
    };

    // 构建 Vercel-like res
    const res: VercelLikeResponse = {
      statusCode: 200,
      headers: {},
      body: undefined,
      ended: false,
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