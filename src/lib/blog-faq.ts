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

const QUESTION_HINTS = [
  'how ', 'what ', 'why ', 'when ', 'which ', 'who ',
  'can ', 'do ', 'does ', 'is ', 'are ', 'should ',
  'where ', '?',
];

function looksLikeQuestion(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (t.endsWith('?')) return true;
  return QUESTION_HINTS.some((hint) => t.startsWith(hint));
}

/**
 * Parse a flat markdown body into `[{ depth, text }]` headings plus
 * paragraphs. Pure string operations — no markdown AST dependency.
 */
function flattenBody(body: string): { headings: ExtractedHeading[]; paragraphs: Array<{ heading: ExtractedHeading | null; text: string }> } {
  const lines = body.split(/\r?\n/);
  const headings: ExtractedHeading[] = [];
  const paragraphs: Array<{ heading: ExtractedHeading | null; text: string }> = [];
  let current: { heading: ExtractedHeading | null; text: string[] } = { heading: null, text: [] };

  function flush() {
    const text = current.text.join(' ').trim();
    if (text.length > 0) paragraphs.push({ heading: current.heading, text });
    current = { heading: null, text: [] };
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('## ')) {
      flush();
      const heading: ExtractedHeading = { depth: 2, text: line.slice(3).trim() };
      headings.push(heading);
      current = { heading, text: [] };
    } else if (line.startsWith('### ')) {
      flush();
      const heading: ExtractedHeading = { depth: 3, text: line.slice(4).trim() };
      headings.push(heading);
      current = { heading, text: [] };
    } else if (line.startsWith('# ')) {
      // Skip H1 — the page title already covers it.
      continue;
    } else if (line === '' || /^[-*_]{3,}$/.test(line)) {
      flush();
    } else {
      current.text.push(line.trim());
    }
  }
  flush();
  return { headings, paragraphs };
}

export function extractBlogFAQ(body: string | undefined, max = 4): BlogFAQ[] {
  if (!body) return [];
  const { paragraphs } = flattenBody(body);
  const faqs: BlogFAQ[] = [];
  for (const para of paragraphs) {
    if (!para.heading) continue;
    if (faqs.length >= max) break;
    const question = para.heading.text.replace(/\?+\s*$/, '?');
    if (!looksLikeQuestion(question)) continue;
    const answer = para.text
      .replace(/\s+/g, ' ')
      .slice(0, 320)
      .trim();
    if (answer.length < 30) continue;
    faqs.push({ question, answer });
  }
  return faqs;
}