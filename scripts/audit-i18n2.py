import json
import os

# For each locale, count empty/short strings across all keys
def collect_strings(d, prefix=''):
    out = {}
    for k, v in d.items():
        path = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            out.update(collect_strings(v, path))
        elif isinstance(v, str):
            out[path] = v
        elif isinstance(v, list):
            for i, item in enumerate(v):
                if isinstance(item, dict):
                    out.update(collect_strings(item, f'{path}[{i}]'))
                elif isinstance(item, str):
                    out[f'{path}[{i}]'] = item
    return out

# Check if non-en locales are missing any strings present in en
en = json.load(open('src/i18n/en/translation.json'))
en_strs = collect_strings(en)

print(f'EN: {len(en_strs)} strings total')

for loc in ['de', 'fr', 'ja', 'kr', 'cn']:
    d = json.load(open(f'src/i18n/{loc}/translation.json'))
    loc_strs = collect_strings(d)
    print(f'\n=== {loc}: {len(loc_strs)} strings ===')
    missing = set(en_strs.keys()) - set(loc_strs.keys())
    print(f'  missing from {loc}: {len(missing)}')
    if missing:
        for m in sorted(list(missing))[:30]:
            print(f'    - {m}')

    # Find empty values
    empty = [k for k, v in loc_strs.items() if v == '' or v == None]
    print(f'  empty values: {len(empty)}')
    for e in empty[:20]:
        print(f'    - "{e}" = ""')

    # Very short strings that are likely placeholder/fallback (less than 3 chars or only punctuation)
    short = [(k, v) for k, v in loc_strs.items() if len(v) < 3]
    print(f'  short strings (<3 chars): {len(short)}')