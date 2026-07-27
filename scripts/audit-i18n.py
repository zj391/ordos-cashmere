import json
for loc in ['en', 'de', 'fr', 'ja', 'kr', 'cn']:
    d = json.load(open(f'src/i18n/{loc}/translation.json'))
    keys = list(d.keys())
    print(f'{loc}: top-level keys = {keys}')
    print(f'  size: {len(json.dumps(d))} bytes, products section exists: {"products" in d}')
    if 'products' in d:
        prod = d['products']
        # Check empty values
        empty = [(k, v) for k, v in prod.items() if v == '' or v == [] or v == None]
        print(f'  products keys: {list(prod.keys())}')
        print(f'  empty products values: {empty}')