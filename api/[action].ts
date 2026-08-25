/**
 * Vercel Hobby compatibility dispatcher.
 * Keeps existing public paths such as /api/inquiry and /api/chat while deploying
 * them through one dynamic Serverless Function instead of six independent files.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import chat from '../src/server/api/public/chat';
import chatToCrm from '../src/server/api/public/chat-to-crm';
import downloadGate from '../src/server/api/public/download-gate';
import indexNow from '../src/server/api/public/indexnow';
import inquiry from '../src/server/api/public/inquiry';
import syncInquiryToLead from '../src/server/api/public/sync-inquiry-to-lead';

const handlers: Record<string, (req: VercelRequest, res: VercelResponse) => Promise<unknown> | unknown> = {
  chat,
  'chat-to-crm': chatToCrm,
  'download-gate': downloadGate,
  indexnow: indexNow,
  inquiry,
  'sync-inquiry-to-lead': syncInquiryToLead,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query?.action;
  const action = Array.isArray(raw) ? raw[0] : raw;
  const target = handlers[String(action || '')];
  if (!target) return res.status(404).json({ error: 'api_route_not_found' });
  return target(req, res);
}
