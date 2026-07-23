import json
from collections import Counter
with open('src/data/products.json') as f:
  data = json.load(f)
PLACEHOLDERS = {'customize', '多种颜色可选', 'multiple colors available', 'color cards'}
c = Counter()
for cat in data['categories']:
  for p in cat['products']:
    for col in p.get('colors', []):
      if col.lower() not in PLACEHOLDERS:
        c[col] += 1
for name, count in c.most_common(20):
  print(f'{count:4d}  {name!r}')