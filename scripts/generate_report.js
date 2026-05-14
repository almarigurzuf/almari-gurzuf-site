
import { MANUAL_PLACES as manual } from '../src/sections/guide/data/manual_places.js';
import { PARSED_PLACES as parsed } from '../src/sections/guide/data/parsed_places.js';
import { SCRAPED_PLACES as scraped } from '../src/sections/guide/data/scraped_places.js';

const all = { ...scraped, ...parsed, ...manual };

const report = {};

Object.entries(all).forEach(([id, p]) => {
    const city = p.city || 'all';
    const cat = p.category || 'other';
    
    if (!report[city]) report[city] = {};
    if (!report[city][cat]) report[city][cat] = [];
    
    report[city][cat].push({
        id,
        name: p.name,
        image: p.image || '',
        hasImage: !!(p.image && p.image.trim())
    });
});

let output = '# Полный список карточек путеводителя\n';
output += '\nДля каждой карточки указан статус фотографии. 📸 — фото есть, ❌ — фото отсутствует.\n';

Object.keys(report).sort().forEach(city => {
    output += `\n## Город: ${city.toUpperCase()}\n`;
    Object.keys(report[city]).sort().forEach(cat => {
        output += `\n### Категория: ${cat}\n`;
        report[city][cat].forEach(p => {
            const status = p.hasImage ? '📸' : '❌';
            const imgPath = p.hasImage ? ` (\`${p.image}\`)` : '';
            output += `- [${status}] **${p.name}**${imgPath} (ID: \`${p.id}\`)\n`;
        });
    });
});

import fs from 'fs';
fs.writeFileSync('./scratch/guide_report.md', output);
