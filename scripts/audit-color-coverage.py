import json
from collections import Counter
d=json.load(open('src/data/products.json',encoding='utf-8'))
prods=[p for c in d['categories'] for p in c['products']]
real,empty=0,0
counter=Counter()
for p in prods:
    raw=p.get('colors') or []
    seen=[x for x in raw if x.lower() not in {'customize','多种颜色可选','multiple colors available','color cards'}]
    if seen:
        real+=1
        counter.update(seen)
    else:
        empty+=1
print('with_real_color_names:',real)
print('placeholder_only:',empty)
print('top:',counter.most_common(15))