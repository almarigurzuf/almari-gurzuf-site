import os
import re

tabs_dir = '/Users/vladkozjaevgmail.com/Desktop/AI/Project/site/src/sections/guide/tabs/'
coord_pattern = re.compile(r'44\.\d+,3[34]\.\d+')

results = []

for filename in os.listdir(tabs_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(tabs_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Find cards (simplified)
            # We look for card names and subsequent route links
            cards = content.split('class="guide-card')
            for card in cards[1:]:
                # Extract name
                name_match = re.search(r'class="guide-card-name">([^<]+)<', card)
                if name_match:
                    name = name_match.group(1).strip()
                    
                    # Extract coordinates from btn-route
                    coord_match = coord_pattern.search(card)
                    if coord_match:
                        coord = coord_match.group(0)
                        results.append(f"{filename}: {name} -> {coord}")
                    else:
                        # Some have names instead of coords in URL, skip for now or note
                        results.append(f"{filename}: {name} -> NO COORD")

with open('extracted_coords.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))
