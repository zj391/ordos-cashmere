/**
 * Auto-extract a small FAQ block from a blog post's markdown body.
 *
 * Strategy: pick the first N h2/h3 question-shaped headings (lines that look
 * like questions) and pair each one with the paragraph that follows it until
 * the next heading. The pair is normalized into {q, a} so downstream schema
 * helpers (FAQPage) can consume it directly.
 *
 * English-only at the moment because the underlying question heuristics are
 * anchored to ASCII question marks and Western interrogative words. Other
 * locales can be added later by swapping the detector set.
 */
export interface BlogFAQ {
  question: string;
  answer: string;
}

interface ExtractedHeading {
  depth: number;
  text: string;
}

// Locale-aware interrogative word set. Covers EN + 5 other locales.
// Extend by adding more first words per locale — order matters only for
// human readability, not matching.
const QUESTION_WORDS: Record<string, string[]> = {
  en: ['what', 'how', 'why', 'when', 'which', 'where', 'who', 'is', 'are', 'do', 'does', 'did', 'can', 'could', 'should', 'would', 'will', 'whose', 'whom'],
  de: ['was', 'wie', 'warum', 'wieso', 'wann', 'welche', 'welcher', 'welches', 'wo', 'wer', 'wem', 'ist', 'sind', 'kann', 'können', 'soll', 'sollte', 'wird'],
  fr: ['quoi', 'comment', 'pourquoi', 'quand', 'quel', 'quelle', 'quels', 'quelles', 'où', 'qui', 'que', 'est', 'sont', 'peut', 'doit', 'faudrait'],
  ja: ['何', 'なぜ', 'どうして', 'いつ', 'どの', 'どこ', '誰', 'どう', 'どれ', 'できる'],
  kr: ['무엇', '왜', '언제', '어디', '어떤', '어떻게', '누구', '있나'],
  cn: ['什么', '为何', '为什么', '怎么', '怎样', '如何', '何时', '哪个', '哪里', '谁', '可以', '能不能'],
};

// True if the heading ends with '?' OR starts with a locale question word.
// Also handles embedded questions like "Quality Control: What to Look For".
function looksLikeQuestion(text: string, locale?: string): boolean {
  const t = text.trim();
  if (t.endsWith('?')) return true;
  // Try leading word match against the locale's question-word set.
  const first = (t.split(/\s+/)[0] || '').toLowerCase().replace(/[,.!?]\( ([^,]*?)$/, '$1').replace(/[,.!?]+$/, '');
  const words = QUESTION_WORDS[locale || 'en'] || QUESTION_WORDS.en;
  if (words.includes(first)) return true;
  // Embedded: any question-word in the heading makes it a FAQ candidate.
  // E.g. "Quality Control: What to Look For in a Supplier".
  const lower = t.toLowerCase();
  return words.some((w) => new RegExp(`\\b${w}\\b`).test(lower));
}

/**
 * Parse a flat markdown body into `[{ depth, text }]` headings plus
 * per-section text blocks. Pure string operations — no markdown AST dependency.
 *
 * 2026-08-20 fix: was emitting one paragraph per text-block per heading,
 * which meant a section like:
 *
 *   ## What each goat is best for
 *   **Alashan** — ...   (para 1)
 *   **Ordos** — ...    (para 2)
 *   **Mongolian** — .. (para 3)
 *
 * produced 3 FAQ entries with the same Q "What each goat is best for".
 * Now we merge all consecutive text-blocks under one heading into a
 * single section, so each heading maps to exactly one FAQ answer.
 */
function flattenBody(body: string): { headings: ExtractedHeading[]; paragraphs: Array<{ heading: ExtractedHeading | null; text: string }> } {
  const lines = body.split(/\r?\n/);
  const headings: ExtractedHeading[] = [];
  const paragraphs: Array<{ heading: ExtractedHeading | null; text: string }> = [];
  let current: { heading: ExtractedHeading | null; text: string[] } = { heading: null, text: [] };

  function flush() {
    const text = current.text.join(' ').trim();
    if (text.length > 0) {
      paragraphs.push({ heading: current.heading, text });
    }
    current.text = [];
  }

  function setHeading(depth: number, text: string) {
    // Flush any pending text under the OLD heading first.
    flush();
    const heading: ExtractedHeading = { depth, text };
    headings.push(heading);
    current.heading = heading;
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('## ')) {
      setHeading(2, line.slice(3).trim());
    } else if (line.startsWith('### ')) {
      setHeading(3, line.slice(4).trim());
    } else if (line.startsWith('# ')) {
      // Skip H1 — the page title already covers it.
      continue;
    } else if (line === '' || /^[-*_]{3,}$/.test(line)) {
      // Blank line / horizontal rule: keep accumulating into current section.
      // Do NOT flush mid-section — that was the old bug.
      continue;
    } else {
      current.text.push(line.trim());
    }
  }
  flush();
  return { headings, paragraphs };
}

export function extractBlogFAQ(
  body: string | undefined,
  max = 4,
  locale?: string,
): BlogFAQ[] {
  if (!body) return [];
  const { paragraphs } = flattenBody(body);
  const faqs: BlogFAQ[] = [];
  for (const para of paragraphs) {
    if (!para.heading) continue;
    // 2026-08-20 SEO: H2 + H3 both eligible (was H3 only). Many blog posts
    // organize FAQ-style sections as H2 (e.g. "What Is Cashmere Micron Count?",
    // "How Micron Count Is Measured") — restricting to H3 missed most real Qs.
    if (para.heading.depth !== 2 && para.heading.depth !== 3) continue;
    if (faqs.length >= max) break;
    const question = para.heading.text.replace(/\?+\s*$/, '?');
    // Locale-aware question detection: ?结尾 OR 疑问词开头 OR embedded 疑问词.
    if (!looksLikeQuestion(question, locale)) continue;
    const answer = para.text
      .replace(/\s+/g, ' ')
      .slice(0, 320)
      .trim();
    if (answer.length < 30) continue;
    faqs.push({ question, answer });
  }
  return faqs;
}