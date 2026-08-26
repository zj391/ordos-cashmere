import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2];
const outputPath = process.argv[3] || '/tmp/query-performance-analysis.json';

if (!inputPath) {
  throw new Error('Usage: node scripts/seo/analyze-query-performance.mjs <input-file> [output-file]');
}

const rows = fs.readFileSync(inputPath, 'utf8')
  .trim()
  .split(/\r?\n/)
  .map((line) => {
    const [query, clicks, impressions, ctr, position] = line.split('\t');
    return {
      query: query.trim(),
      clicks: Number(clicks),
      impressions: Number(impressions),
      ctr: Number.parseFloat(ctr),
      position: Number(position),
    };
  })
  .filter((row) => row.query && [row.clicks, row.impressions, row.ctr, row.position].every(Number.isFinite));

const productPatterns = [
  ['scarves-shawls', /scarf|shawl|wrap|pashmina|披肩|围巾|ショール/i],
  ['leggings-accessories', /legging|glove|sock|hat|beanie|beret|帽|모자/i],
  ['yarn-fiber', /yarn|worsted|woolen|cone|knitting|spinning|garn|糸|원사/i],
  ['sweaters-knitwear', /sweater|turtleneck|coat|hooded|pullover|cardigan|コート/i],
];

function intentFor(query) {
  const normalized = query.toLowerCase();
  if (/^erdos|\berdos\b|1436/.test(normalized)) return 'brand-navigation';
  if (/price|sale|clearance|deadstock|official shop|online shop|per kilo|가격/.test(normalized)) return 'commercial-or-competitor';
  if (/care|iron|caring|how to|combien de fils|2 fils|2 fils ou 4 fils|worsted vs woolen|quality grades|grade/.test(normalized)) return 'knowledge';
  if (/wholesale|manufacturer|supplier|odm|b2b|exporter|factory/.test(normalized)) return 'b2b-commercial';
  if (productPatterns.some(([, pattern]) => pattern.test(query))) return 'product-discovery';
  return 'other';
}

function clusterFor(query) {
  for (const [cluster, pattern] of productPatterns) {
    if (pattern.test(query)) return cluster;
  }
  return intentFor(query);
}

function opportunityScore(row) {
  const rankFit = row.position >= 8 && row.position <= 40 ? 1.5 : row.position < 8 ? 0.65 : 0.8;
  const clickGap = Math.max(0, 0.08 - row.ctr) * 100;
  return Number((row.impressions * rankFit * (1 + clickGap)).toFixed(2));
}

const enriched = rows.map((row) => ({
  ...row,
  intent: intentFor(row.query),
  cluster: clusterFor(row.query),
  opportunityScore: opportunityScore(row),
}));

const total = (field) => enriched.reduce((sum, row) => sum + row[field], 0);
const by = (field) => Object.values(enriched.reduce((acc, row) => {
  const key = row[field];
  acc[key] ||= { key, queries: 0, clicks: 0, impressions: 0, opportunityScore: 0, examples: [] };
  acc[key].queries += 1;
  acc[key].clicks += row.clicks;
  acc[key].impressions += row.impressions;
  acc[key].opportunityScore += row.opportunityScore;
  acc[key].examples.push(row.query);
  return acc;
}, {})).map((item) => ({
  ...item,
  opportunityScore: Number(item.opportunityScore.toFixed(2)),
  examples: item.examples.slice(0, 8),
})).sort((a, b) => b.opportunityScore - a.opportunityScore);

const quickWins = enriched
  .filter((row) => row.impressions >= 5 && row.position >= 8 && row.position <= 40 && row.intent !== 'commercial-or-competitor')
  .sort((a, b) => b.opportunityScore - a.opportunityScore);

const report = {
  input: path.resolve(inputPath),
  totals: {
    queries: enriched.length,
    clicks: total('clicks'),
    impressions: total('impressions'),
    weightedCtr: Number(((total('clicks') / total('impressions')) * 100).toFixed(2)),
  },
  byIntent: by('intent'),
  byCluster: by('cluster'),
  quickWins,
  rankedQueries: [...enriched].sort((a, b) => b.opportunityScore - a.opportunityScore),
};

fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, totals: report.totals, quickWins: quickWins.slice(0, 12) }, null, 2));
