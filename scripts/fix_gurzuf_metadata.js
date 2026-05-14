
import fs from 'fs';

const SOUTH_FILE = './src/sections/guide/data/regions/south.js';

const gurzufFixes = [
    'chekhov-dacha', 'pushkin-museum-gurzuf', 'gurzuf-central-beach', 
    'smakmarket-gurzuf', 'market-gurzuf', 'molbert-cafe', 'gurzuf-park', 
    'adalary-rocks', 'suuk-su-palace', 'ayu-dag-mountain', 'pushkin-grotto',
    'shalyapin-rock', 'genoise-rock-gurzuf', 'sommelier-gurzuf', 'venice-gurzuf',
    'pud-gurzuf', 'gurzuf-embankment', 'gurzuf-cat-monument', 'red-stone-rock',
    'roman-kosh-peak', 'artek-camp'
];

function fixGurzuf() {
    let content = fs.readFileSync(SOUTH_FILE, 'utf8');
    let count = 0;

    for (const id of gurzufFixes) {
        const regex = new RegExp(`(['"]?${id}['"]?\\s*:\\s*{[\\s\\S]*?})`, 'g');
        content = content.replace(regex, (match) => {
            let body = match;
            // Set city to gurzuf
            body = body.replace(/city:\s*['"][^'"]*['"]/, "city: 'gurzuf'");
            
            // Try to guess category if it's 'other'
            if (body.includes("category: 'other'") || body.includes("category: 'all'")) {
                let cat = 'other';
                if (body.match(/ресторан|кафе|кухня|еда|чек/i)) cat = 'food';
                else if (body.match(/пляж|берег|купание/i)) cat = 'beaches';
                else if (body.match(/парк|сад|фонтан/i)) cat = 'parks';
                else if (body.match(/музей|дворец|история|дач[ау]|крепость/i)) cat = 'history';
                else if (body.match(/гора|скал[аы]|природа|мыс|грот/i)) cat = 'nature';
                else if (body.match(/супермаркет|магазин|рынок/i)) cat = 'shopping';
                
                body = body.replace(/category:\s*['"][^'"]*['"]/, `category: '${cat}'`);
            }
            count++;
            return body;
        });
    }

    fs.writeFileSync(SOUTH_FILE, content);
    console.log(`✅ Updated ${count} Gurzuf cards in south.js!`);
}

fixGurzuf();
