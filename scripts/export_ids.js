
import { MANUAL_PLACES as manual } from '../src/sections/guide/data/manual_places.js';
import { PARSED_PLACES as parsed } from '../src/sections/guide/data/parsed_places.js';
import { SCRAPED_PLACES as scraped } from '../src/sections/guide/data/scraped_places.js';

const all = { ...scraped, ...parsed, ...manual };

let output = 'ID | Название | Город | Категория\n';
output += '------------------------------------\n';

Object.entries(all).forEach(([id, p]) => {
    output += `${id} | ${p.name || 'Без названия'} | ${p.city || 'all'} | ${p.category || 'other'}\n`;
});

import fs from 'fs';
fs.writeFileSync('./scratch/all_guide_ids.txt', output);
console.log('Successfully wrote ' + Object.keys(all).length + ' IDs to scratch/all_guide_ids.txt');
