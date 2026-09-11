/**
 * 客户退订意图检测 (阶段 5 P0, 2026-09-10)
 *
 * 用途:
 *   - email inbound (resend-inbound) 检测 STOP / unsubscribe 关键词 → 拉黑
 *   - WhatsApp inbound (wa-inbound) 检测 STOP → 拉黑
 *
 * 设计:
 *   - 多语言强信号 (en/de/fr/ja/kr/cn) 完整短语匹配
 *   - 'stop' 弱信号只匹配 'stop' 单字 / 'stop sending' 等 (避免 'please stop calling' 误杀)
 *   - 不区分大小写 (lowercase 后匹配)
 *   - False positive 风险极低: 客户在询盘邮件回复里说"取消订阅"基本就是要退订
 *
 * 返回: true = 命中退订信号
 */

const STRONG_PATTERNS: string[] = [
  // English
  'unsubscribe', 'unsub', 'opt out', 'opt-out', 'remove me', 'delete my',
  'do not contact', "i don't want", 'no longer interested', 'take me off',
  // Chinese
  '退订', '取消订阅', '停止发送', '请停止', '不要发', '别发了', '取消',
  '不需要', '不要再', '请不要再',
  // French
  'désabonner', 'désabonnement',
  // German
  'abbestellen', 'abmelden',
  // Japanese
  '配信停止', '配信を停止', '解除',
  // Korean
  '구독 취소', '수신 거부',
];

const STOP_REGEX_PATTERNS: RegExp[] = [
  /\bstop\s+(?:sending|emailing|emails|newsletter)\b/i,
  /^\s*stop\s*\.?\s*$/i,
  /^\s*unsubscribe\s*\.?\s*$/i,
];

export function detectUnsubscribeIntent(text: string, subject: string = ''): boolean {
  const haystack = `${subject} ${text}`.toLowerCase().trim();
  if (!haystack) return false;

  for (const p of STRONG_PATTERNS) {
    if (haystack.includes(p.toLowerCase())) return true;
  }

  for (const re of STOP_REGEX_PATTERNS) {
    if (re.test(haystack)) return true;
  }

  return false;
}
