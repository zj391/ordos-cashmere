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

function looksLikeQuestion(text: string): boolean {
  // A heading is a question only if it ends with '?'. Heading-style
  // sentences like "How to read a cashmere quote" without '?' are
  // descriptive titles, not questions, and must not be treated as FAQs.
  return text.trim().toLowerCase().endsWith('?');
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
    // Flush emits one paragraph per (heading, text) pair. We only push
    // when there is actual text — empty-text flushes (the blank line
    // after a heading) are dropped. The heading is NOT reset here, so
    // consecutive paragraphs in the same section still see the heading;
    // the heading is reset only when a new heading is set in the loop.
    const text = current.text.join(' ').trim();
    if (text.length > 0) {
      paragraphs.push({ heading: current.heading, text });
    }
    current.text = [];
  }

  function setHeading(depth: number, text: string) {
    const heading: ExtractedHeading = { depth, text };
    headings.push(heading);
    current.heading = heading;
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('## ')) {
      flush();
      setHeading(2, line.slice(3).trim());
    } else if (line.startsWith('### ')) {
      flush();
      setHeading(3, line.slice(4).trim());
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
    // Only H3 headings become FAQ questions. H2 sections are page-level
    // sections like "Which One Should You Buy?" — descriptive titles,
    // not questions, even if they happen to end in '?'.
    if (para.heading.depth !== 3) continue;
    if (faqs.length >= max) break;
    // Normalize trailing multiple question marks ("??" -> "?") but do NOT
    // force-add a '?'. Heading-style titles like "How to read a cashmere
    // quote" without a question mark are descriptive, not questions, and
    // must not be treated as FAQs.
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