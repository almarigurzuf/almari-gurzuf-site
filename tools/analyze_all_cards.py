import os
import re
import json

tabs_dir = '/Users/vladkozjaevgmail.com/Desktop/AI/Project/site/src/sections/guide/tabs/'
results = []

for filename in os.listdir(tabs_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(tabs_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Find all names
            names = re.findall(r'class="guide-card-name">([^<]+)<', content)
            
            # For each name, find the next route URL
            # We'll do it by splitting the content by name tags
            parts = re.split(r'class="guide-card-name">', content)
            for i, part in enumerate(parts[1:]):
                name = part.split('<')[0].strip()
                
                # Find the first yandex link in this part
                route_match = re.search(r'href="(https://yandex\.ru/maps/[^"]+)"', part)
                route_url = route_match.group(1) if route_match else "NO ROUTE"
                
                has_details = 'btn-details' in part
                
                results.append({
                    'file': filename,
                    'name': name,
                    'route_url': route_url,
                    'has_details': has_details
                })

with open('all_cards.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print(f"Total cards processed: {len(results)}")
