
"""
Verify the SEO fixes on the built static output.

Run after `npm run build`:
    python3 scripts/verify_seo_titles.py
"""
import re, os, sys, collections

ROOT = '.vercel/output/static'
LOCALES = ['en', 'de', 'fr', 'ja', 'kr', 'cn']

if not os.path.isdir(ROOT):
    sys.exit('no build output - run npm run build first')

def title_of(path):
    html = open(path, encoding='utf-8', errors='ignore').read()
    m = re.search(r'<title>(.*?)</title>', html, re.S)
    return m.group(1).strip() if m else None

def meta_of(path, name):
    html = open(path, encoding='utf-8', errors='ignore').read()
    m = re.search(r'<meta name="%s" content="(.*?)"' % name, html, re.S)
    return m.group(1) if m else None

pages = collections.defaultdict(list)
indexable = 0
noindex = 0
for dp, dn, fn in os.walk(ROOT):
    if 'index.html' not in fn:
        continue
    p = os.path.join(dp, 'index.html')
    rel = os.path.relpath(p, ROOT)
    html = open(p, encoding='utf-8', errors='ignore').read()
    if re.search(r'<meta name="robots" content="[^"]*noindex', html):
        noindex += 1
        continue
    indexable += 1
    t = title_of(p)
    if t:
        pages[t].append(rel)

print('indexable pages : %d   (noindex excluded: %d)' % (indexable, noindex))
dups = {t: v for t, v in pages.items() if len(v) > 1}
print('duplicate titles: %d groups' % len(dups))

def kind(rel):
    if rel.startswith('products/') or '/products/' in rel:
        return 'product'
    if '/category/' in rel:
        return 'category'
    if '/tag/' in rel:
        return 'tag'
    return 'other'

by_kind = collections.Counter()
for t, v in dups.items():
    by_kind[kind(v[0])] += 1
print('  by page type:', dict(by_kind) or '(none)')

if dups:
    print('\n--- first 10 duplicate groups ---')
    for t, v in sorted(dups.items(), key=lambda kv: -len(kv[1]))[:10]:
        print('  x%d  %s' % (len(v), t[:88]))
        for x in sorted(v)[:4]:
            print('        ', x)

# the specialty pages must not share a title across locales
print('\n--- specialty pages ---')
for slug in ['dehaired-cashmere', 'cashmere-yarn-types']:
    titles = {}
    for loc in LOCALES:
        p = os.path.join(ROOT, loc, slug, 'index.html')
        if os.path.exists(p):
            titles[loc] = title_of(p)
    uniq = len(set(titles.values()))
    status = 'OK' if uniq == len(titles) else 'DUPLICATE'
    print('  %-22s %d/%d unique  %s' % (slug, uniq, len(titles), status))
    for loc, t in titles.items():
        print('      %s: %s' % (loc, t))

# the product pages: the reference must be inside the first 60 characters
print('\n--- product title checks ---')
prod = [(t, v) for t, v in pages.items() if kind(v[0]) == 'product']
ref_total = ref_outside = 0
over = 0
for t, v in prod:
    if ' - Ref ' in t:
        ref_total += 1
        if t.index(' - Ref ') > 60:
            ref_outside += 1
    over += sum(1 for x in v if len(t) > 90)
print('  product titles      : %d' % len(prod))
print('  with reference      : %d' % ref_total)
print('  reference past 60ch : %d' % ref_outside)
print('  longer than 90 chars: %d' % over)
