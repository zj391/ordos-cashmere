import json
d = json.load(open('src/data/products.json'))
cats = [(c['id'], len(c['products'])) for c in d['categories']]
print('Categories:', cats)
print('Total products:', sum(len(c['products']) for c in d['categories']))
print('Sample product:')
p = d['categories'][0]['products'][0]
print('  id:', p.get('id'))
print('  name:', p.get('name'))
print('  description:', p.get('description', '<MISSING>')[:120])
print('  images:', p.get('images'))
print('  material:', p.get('material'))
print('  micron:', p.get('micron'))
print('  weight_grams:', p.get('weight_grams'))
print('  size:', p.get('size'))
print('  season:', p.get('season'))
print('  applications:', p.get('applications'))
print('  product_advantages:', p.get('product_advantages'))
print('  size_chart:', p.get('size_chart'))
print('  faq:', p.get('faq'))

# Tally how many products actually have rich detail fields populated
fields = ['description', 'size', 'weight_grams', 'gauge', 'season', 'packaging',
          'custom_options', 'sample_policy', 'payment_terms', 'shipping_options',
          'certifications', 'applications', 'customization_services', 'oem_workflow',
          'product_advantages', 'faq', 'size_chart', 'care_instructions']
all_prods = [p for c in d['categories'] for p in c['products']]
print('\n--- Coverage of rich detail fields across all 591 products ---')
for f in fields:
    populated = sum(1 for p in all_prods if p.get(f))
    print(f'  {f}: {populated} / {len(all_prods)}')

# Same product sampled across categories
print('\n--- One product per category ---')
for c in d['categories']:
    p = c['products'][0]
    print(f'[{c["id"]}] {p["id"]} | desc_len={len(p.get("description",""))} | adv={len(p.get("product_advantages",[]))} | apps={len(p.get("applications",[]))} | faq={len(p.get("faq",[]))}')