import { MANUAL_PLACES } from '../src/sections/guide/data/manual_places.js';
import { SCRAPED_PLACES } from '../src/sections/guide/data/scraped_places.js';
import fs from 'fs';

const allPlaces = { ...MANUAL_PLACES, ...SCRAPED_PLACES };
const emptyPlaces = [];

for (const [id, data] of Object.entries(allPlaces)) {
    const descLen = (data.desc || '').length;
    const hasTip = !!data.tip;
    const hasPrices = !!data.prices || (data.facts && data.facts.some(f => f.label.toLowerCase().includes('цена') || f.label.toLowerCase().includes('билет') || f.label.toLowerCase().includes('стоимость')));

    if (descLen < 150 || !hasTip || !hasPrices) {
        emptyPlaces.push({
            id,
            name: data.name,
            descLen,
            hasTip,
            hasPrices
        });
    }
}

console.log(`Found ${emptyPlaces.length} places that need more detail.`);
console.log('Sample of top 10 "thin" places:');
console.log(JSON.stringify(emptyPlaces.slice(0, 10), null, 2));

fs.writeFileSync('/Users/vladkozjaevgmail.com/Desktop/AI/Project/site/scratch/thin_places.json', JSON.stringify(emptyPlaces, null, 2));
