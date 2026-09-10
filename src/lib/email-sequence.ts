/**
 * 8 轮 nurture 邮件序列 — 询盘自动化阶段 1 (2026-09-10)
 *
 * 设计：
 * - 每个 lead 独立跑一条 8 轮序列，email_sequence_step ∈ [0..8]，9 = 完成
 * - A 级：day 0/3/7/14/21/30/45/60（密集）
 * - B 级：day 7/14/30/60（中等）
 * - C 级：day 30/60（稀疏）
 * - D 级：skip（不主动外发）
 * - 任一轮客户回复 → email_replied_at 置位 → 序列暂停（cron 检测后跳过）
 * - 任一轮邮件 hard bounce 或 unsubscribe → status 切到 unsubscribed → 跳过
 *
 * 国际化：lead.country 推断 locale（CN → cn / KR → kr / JP → ja / DE → de /
 * FR → fr，其他 → en）。locale 用于选择字体和文案。
 *
 * 模板内容：保持克制 B2B editorial voice — 不堆形容词、不堆 emoji。
 * 每封邮件都有一个明确的 CTA + 退订链接。
 */

export type LeadGrade = 'A' | 'B' | 'C' | 'D';

export interface SequenceStep {
  /** 距上一封的天数 */
  daysAfterPrev: number;
  /** 邮件主题 */
  subject: string;
  /** HTML 模板（用 {{name}} {{company}} {{unsubscribeUrl}} 占位） */
  htmlTpl: string;
  /** campaign tag, 写到 Resend tags */
  campaign: string;
}

export interface LocalePack {
  fontStack: string;
  /** 8 个 step 的本地化 */
  steps: SequenceStep[];
  /** 退订文案 */
  unsubscribeLabel: string;
  /** 页脚签名 */
  footer: string;
}

const FOOTER_EN = 'DONGXIAO® Cashmere · Ordos · Since 2002 · You are receiving this because you inquired on erdosdx.com.';
const FOOTER_CN = '东霄羊绒 · 鄂尔多斯 · 23年源头工厂 · 您因在 erdosdx.com 提交询盘而收到本邮件。';

const UNSUBSCRIBE_EN = 'Unsubscribe';
const UNSUBSCRIBE_CN = '退订';

// ===== English / 默认 =====

const EN_STEPS: SequenceStep[] = [
  {
    daysAfterPrev: 0,
    campaign: 'nurture_day0_intro',
    subject: 'Your DONGXIAO Cashmere inquiry — next step',
    htmlTpl: `
<p>Hi {{name}},</p>
<p>Following your inquiry on <strong>{{inquiryTypeLabel}}</strong>, I am {{salesName}} from DONGXIAO Cashmere, the Ordos factory team.</p>
<p>Within the next 24 hours we will share:</p>
<ul>
  <li>Detailed quotation aligned to your quantity ({{quantity}})</li>
  <li>Mill certifications (RWS, ISO 9001, OEKO-TEX)</li>
  <li>Sample shipment options via DHL/FedEx (paid by you, refunded against first order)</li>
</ul>
<p>If anything is urgent, reach me directly on WhatsApp: {{whatsapp}}.</p>
<p>— {{salesName}}<br/>DONGXIAO Cashmere · Ordos</p>
    `.trim(),
  },
  {
    daysAfterPrev: 3,
    campaign: 'nurture_day3_catalog',
    subject: 'Cashmere catalog & sample options',
    htmlTpl: `
<p>Hi {{name}},</p>
<p>Attached is our latest {{inquiryTypeLabel}} catalog covering micron grades (14.5μm – 16.5μm), color cards (Cambridge 26-2 nm), and current Ordos stock.</p>
<p>Two paths forward — pick whichever fits:</p>
<ol>
  <li><strong>Sample first</strong> — we ship 5 color/grade hangers within 4 working days, USD 80 freight collect.</li>
  <li><strong>Quote + spec sheet</strong> — we send a detailed quotation with yarn count, ply, gauge, and finishing.</li>
</ol>
<p>Reply with option 1 or 2 and we move within the day.</p>
<p>— {{salesName}}</p>
    `.trim(),
  },
  {
    daysAfterPrev: 4,
    campaign: 'nurture_day7_market',
    subject: 'Where the 2026 cashmere market is heading',
    htmlTpl: `
<p>Hi {{name}},</p>
<p>Quick read on this season — three signals relevant to your {{inquiryTypeLabel}} sourcing:</p>
<ol>
  <li>Inner Mongolia combing yield down 8% YoY — raw cashmere price up 6-9%.</li>
  <li>European buyers locking Q3 volume earlier than usual; factory slots in Ordos filling through August.</li>
  <li>USD/CNY at {{fxRate}} — workable window for orders placed before mid-quarter.</li>
</ol>
<p>Full market note: <a href="{{blogUrl}}">2026 Inner Mongolia cashmere factory lead time & market</a>.</p>
<p>If you want to lock a slot, I can hold production capacity for 14 days against a written LOI.</p>
<p>— {{salesName}}</p>
    `.trim(),
  },
  {
    daysAfterPrev: 7,
    campaign: 'nurture_day14_quality',
    subject: 'How we grade raw cashmere — a 4-minute read',
    htmlTpl: `
<p>Hi {{name}},</p>
<p>Sharing our internal grading protocol, since you asked about quality on {{inquiryTypeLabel}}:</p>
<ul>
  <li><strong>Micron</strong>: hand-combed ≤14.5μm (baby) / 14.5–15.5μm (grade A) / 15.5–16.5μm (grade B)</li>
  <li><strong>Length</strong>: 36–42mm for worsted yarn, 32–36mm for woolen</li>
  <li><strong>Yield</strong>: lots tested at 30%+ clean yield (top lot 38%)</li>
  <li><strong>Origin</strong>: 100% Alashan Left Banner + Otog Front Banner herds, RFID-traceable</li>
</ul>
<p>Full breakdown: <a href="{{blogUrl}}">Cashmere grade A vs B vs C — what B2B buyers actually pay for</a>.</p>
<p>— {{salesName}}</p>
    `.trim(),
  },
  {
    daysAfterPrev: 7,
    campaign: 'nurture_day21_logistics',
    subject: 'Lead time, MOQ, and shipping — the practical bits',
    htmlTpl: `
<p>Hi {{name}},</p>
<p>For your {{inquiryTypeLabel}} order ({{quantity}}), the working numbers from Ordos:</p>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
  <tr><th>Stage</th><th>Working days</th></tr>
  <tr><td>Yarn spinning</td><td>15–20</td></tr>
  <tr><td>Knitting / weaving</td><td>20–30</td></tr>
  <tr><td>Finishing (scour / dye)</td><td>10–15</td></tr>
  <tr><td>QC + hand mending</td><td>5–7</td></tr>
  <tr><td>Export prep + docs</td><td>3–5</td></tr>
</table>
<p>Total: <strong>53–77 working days</strong> from PO to FOB Tianjin. Express sample hangers can run in 4 working days.</p>
<p>— {{salesName}}</p>
    `.trim(),
  },
  {
    daysAfterPrev: 9,
    campaign: 'nurture_day30_case',
    subject: 'A recent {{country}}-related project, briefly',
    htmlTpl: `
<p>Hi {{name}},</p>
<p>Sharing one {{industry}}-relevant case study — a brand in your region sourced 1,200 units of <em>fully-fashioned knitwear</em> through our Ordos facility last quarter.</p>
<p>Spec: 2/26nm cashmere, 12-gauge, mid-gauge links, hand-finished collars. Delivered FOB Tianjin in 64 working days.</p>
<p>Reference details and lab reports on request under NDA.</p>
<p>— {{salesName}}</p>
    `.trim(),
  },
  {
    daysAfterPrev: 15,
    campaign: 'nurture_day45_pricing',
    subject: 'Pricing framework — how to think about our quotes',
    htmlTpl: `
<p>Hi {{name}},</p>
<p>A quick framing note so our quotations land clearly:</p>
<ul>
  <li>Raw cashmere: priced per kg, indexed to Inner Mongolia combing spot + micron premium</li>
  <li>Yarn: per kg, with twist / ply / count breakdown on the quote</li>
  <li>Garment OEM: per piece, with full BOM (yarn + labor + trims + finish)</li>
</ul>
<p>We do not engage in reverse-auction price discovery — pricing reflects micron, length, color-card lot, and finishing standard. We are happy to walk you through the math.</p>
<p>— {{salesName}}</p>
    `.trim(),
  },
  {
    daysAfterPrev: 15,
    campaign: 'nurture_day60_close',
    subject: 'Should I close the loop on this inquiry?',
    htmlTpl: `
<p>Hi {{name}},</p>
<p>I have shared catalogs, samples, market notes, and a working lead time on {{inquiryTypeLabel}}.</p>
<p>If timing is not right, no problem — tell me when to revisit. If you are still evaluating, I can hold Ordos capacity for another 30 days and check back.</p>
<p>Reply with "later" and a target date, or "not now" and I will stop.</p>
<p>— {{salesName}}<br/>DONGXIAO Cashmere</p>
    `.trim(),
  },
];

// ===== 中文精简版 =====

const CN_STEPS: SequenceStep[] = EN_STEPS.map((s) => ({
  ...s,
  subject: s.subject
    .replace('Your DONGXIAO Cashmere inquiry — next step', '【东霄羊绒】您询盘的下一步')
    .replace('Cashmere catalog & sample options', '羊绒产品目录与样品方案')
    .replace('Where the 2026 cashmere market is heading', '2026 羊绒市场动态')
    .replace('How we grade raw cashmere — a 4-minute read', '我们如何分级原料羊绒')
    .replace('Lead time, MOQ, and shipping — the practical bits', '交期、起订量与运输')
    .replace('A recent {{country}}-related project, briefly', '一个近期的合作案例')
    .replace('Pricing framework — how to think about our quotes', '报价结构说明')
    .replace('Should I close the loop on this inquiry?', '是否需要暂缓跟进？'),
  htmlTpl: s.htmlTpl
    .replace(/Hi \{\{name\}\},/g, '{{name}} 您好，')
    .replace(/Following your inquiry on <strong>\{\{inquiryTypeLabel\}\}<\/strong>, I am \{\{salesName\}\} from DONGXIAO Cashmere, the Ordos factory team\./, '您在 <strong>{{inquiryTypeLabel}}</strong> 的咨询已收到。我是东霄羊绒鄂尔多斯工厂团队的 {{salesName}}。')
    .replace('Within the next 24 hours we will share:', '接下来 24 小时内您将收到：')
    .replace(/<li>Detailed quotation aligned to your quantity \(\{\{quantity\}\}\)<\/li>/, '<li>基于您数量 ({{quantity}}) 的详细报价</li>')
    .replace(/<li>Mill certifications \(RWS, ISO 9001, OEKO-TEX\)<\/li>/, '<li>工厂资质（RWS / ISO 9001 / OEKO-TEX）</li>')
    .replace(/<li>Sample shipment options via DHL\/FedEx \(paid by you, refunded against first order\)<\/li>/, '<li>DHL/FedEx 样品方案（运费到付，首次订单冲抵）</li>')
    .replace(/If anything is urgent, reach me directly on WhatsApp: \{\{whatsapp\}\}\./, '如有紧急事项，请直接 WhatsApp 联系我：{{whatsapp}}。')
    .replace('Attached is our latest {{inquiryTypeLabel}} catalog covering micron grades (14.5μm – 16.5μm), color cards (Cambridge 26-2 nm), and current Ordos stock.', '附件是最新 {{inquiryTypeLabel}} 产品目录：细度 14.5–16.5μm、色卡（剑桥 26-2 nm）、以及当前鄂尔多斯库存。')
    .replace('Two paths forward — pick whichever fits:', '两条路径，请按需选择：')
    .replace('<li><strong>Sample first</strong> — we ship 5 color/grade hangers within 4 working days, USD 80 freight collect.</li>', '<li><strong>先寄样品</strong> — 4 个工作日内寄出 5 个颜色/等级样片，运费 USD 80 到付。</li>')
    .replace('<li><strong>Quote + spec sheet</strong> — we send a detailed quotation with yarn count, ply, gauge, and finishing.</li>', '<li><strong>报价 + 工艺单</strong> — 我们出具详细报价，含支数、股数、针法和后整理。</li>')
    .replace('Reply with option 1 or 2 and we move within the day.', '回复 "1" 或 "2"，我们当日推进。'),
}));

// 其它语种：直接用英文模板（de/fr/ja/kr 4 国——保持 B2B editorial 通用英文，省去翻译风险）
// 如需翻译可以后续单独 PR。

const FALLBACK_LOCALE: LocalePack = {
  fontStack: "Inter, system-ui, 'Helvetica Neue', Arial, sans-serif",
  steps: EN_STEPS,
  unsubscribeLabel: UNSUBSCRIBE_EN,
  footer: FOOTER_EN,
};

const LOCALES: Record<string, LocalePack> = {
  en: {
    fontStack: "Inter, system-ui, 'Helvetica Neue', Arial, sans-serif",
    steps: EN_STEPS,
    unsubscribeLabel: UNSUBSCRIBE_EN,
    footer: FOOTER_EN,
  },
  cn: {
    fontStack: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    steps: CN_STEPS,
    unsubscribeLabel: UNSUBSCRIBE_CN,
    footer: FOOTER_CN,
  },
  de: FALLBACK_LOCALE,
  fr: FALLBACK_LOCALE,
  ja: FALLBACK_LOCALE,
  kr: FALLBACK_LOCALE,
};

/**
 * 根据 lead 推断 locale（cn/de/fr/ja/kr/en）
 * CN/HK/TW → cn；KR → kr；JP → ja；DE/AT/CH → de；FR/BE → fr；其它 → en
 */
export function inferLocaleFromCountry(country: string): keyof typeof LOCALES {
  const c = (country || '').toUpperCase().trim();
  if (['CN', 'HK', 'TW', 'MO'].includes(c)) return 'cn';
  if (['KR', 'KP'].includes(c)) return 'kr';
  if (['JP'].includes(c)) return 'ja';
  if (['DE', 'AT', 'CH'].includes(c)) return 'de';
  if (['FR', 'BE', 'LU'].includes(c)) return 'fr';
  return 'en';
}

/**
 * 推断某 lead 的 nurture 序列：返回 step 计划表（含 nextDueAt）
 * grade=D → []
 * grade=A → 全 8 轮
 * grade=B → step 2,4,5,7,8（5 轮，去掉 day3 catalog 和 day60 close 简化）
 * grade=C → step 4,8（2 轮，长线培育）
 */
export function planSequence(grade: LeadGrade, startAt: Date): { step: number; dueAt: Date }[] {
  const allSteps = EN_STEPS;
  if (grade === 'D') return [];

  let chosenIndices: number[];
  if (grade === 'A') chosenIndices = [0, 1, 2, 3, 4, 5, 6, 7];
  else if (grade === 'B') chosenIndices = [0, 2, 3, 5, 7]; // day 0 + day 7 + day 14 + day 30 + day 60
  else chosenIndices = [0, 5, 7]; // C: day 0 + day 30 + day 60

  const out: { step: number; dueAt: Date }[] = [];
  let cursor = new Date(startAt);
  for (const idx of chosenIndices) {
    const def = allSteps[idx];
    if (idx === 0) {
      // step 1 (day 0): 立即发
      out.push({ step: idx + 1, dueAt: new Date(cursor) });
    } else {
      cursor = new Date(cursor.getTime() + def.daysAfterPrev * 24 * 60 * 60 * 1000);
      out.push({ step: idx + 1, dueAt: new Date(cursor) });
    }
  }
  return out;
}

/**
 * 把模板里的 {{var}} 替换成实际值（防 XSS：先 escape 再插值）
 */
export function renderStep(
  pack: LocalePack,
  stepIdx: number,
  vars: Record<string, string | number | null | undefined>,
): { subject: string; html: string } {
  const def = pack.steps[stepIdx];
  if (!def) throw new Error(`step_${stepIdx + 1}_not_in_locale`);
  const escapeHtml = (s: any) =>
    String(s ?? '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  const allVars: Record<string, string> = {
    ...Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, escapeHtml(v)])),
  };

  let subject = def.subject;
  let html = def.htmlTpl;
  for (const [k, v] of Object.entries(allVars)) {
    const re = new RegExp(`\\{\\{${k}\\}\\}`, 'g');
    subject = subject.replace(re, v);
    html = html.replace(re, v);
  }

  // 包成完整 HTML 邮件（含退订链接 + 字体）
  const fullHtml = `
<!DOCTYPE html>
<html lang="${pack === LOCALES.cn ? 'zh-CN' : 'en'}">
<head><meta charset="utf-8"><style>body { font-family: ${pack.fontStack}; line-height: 1.55; color: #1c1917; max-width: 560px; margin: 0 auto; padding: 24px; } a { color: #44403c; text-decoration: underline; } table { font-family: ${pack.fontStack}; }</style></head>
<body>
${html}
<hr style="margin-top: 32px; border: 0; border-top: 1px solid #e7e5e4;">
<p style="font-size: 12px; color: #78716c;">${pack.footer}</p>
<p style="font-size: 12px; color: #78716c;"><a href="{{unsubscribeUrl}}">${pack.unsubscribeLabel}</a></p>
</body>
</html>
  `.trim();

  return { subject, html: fullHtml };
}

export function getLocalePack(locale: keyof typeof LOCALES): LocalePack {
  return LOCALES[locale] || LOCALES.en;
}

export const SALES_NAME = process.env.SALES_NAME || 'DONGXIAO Sales';
export const SALES_WHATSAPP = process.env.WHATSAPP_NUMBER || '+86-156-6185-3999';
export const BLOG_URL = process.env.BLOG_LEAD_TIME_URL || 'https://www.erdosdx.com/en/blog/2026-inner-mongolia-cashmere-factory-lead-time-b2b-guide/';
