import json
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

en = collect_strings(json.load(open('src/i18n/en/translation.json')))

# Show short strings for ja, kr, cn (the ones with >5 short strings)
for loc in ['ja', 'kr', 'cn']:
    d = collect_strings(json.load(open(f'src/i18n/{loc}/translation.json')))
    short = [(k, v) for k, v in d.items() if len(v) < 3]
    print(f'\n=== {loc} short strings (likely placeholders) ===')
    for k, v in short[:30]:
        en_val = en.get(k, '<NOT IN EN>')
        print(f'  {k} = "{v}" | EN: "{en_val[:50]}..."')