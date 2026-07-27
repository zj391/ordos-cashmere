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

for loc in ['de', 'fr', 'ja', 'kr', 'cn']:
    d = collect_strings(json.load(open(f'src/i18n/{loc}/translation.json')))
    missing = set(en.keys()) - set(d.keys())
    # Bucket by top-level section
    sections = {}
    for k in missing:
        section = k.split('.')[0]
        sections.setdefault(section, []).append(k)
    print(f'\n=== {loc}: {len(missing)} missing strings by section ===')
    for sec, keys in sorted(sections.items(), key=lambda x: -len(x[1])):
        print(f'  {sec}: {len(keys)} missing')
        for k in keys[:3]:
            print(f'    - {k}')
        if len(keys) > 3:
            print(f'    ... and {len(keys)-3} more')