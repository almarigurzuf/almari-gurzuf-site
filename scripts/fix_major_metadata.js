
import fs from 'fs';

const MANUAL_PLACES_FILE = './src/sections/guide/data/manual_places.js';

const majorFixes = {
    'swallows-nest': { city: 'gaspra', category: 'history', region: 'south' },
    'livadia-palace': { city: 'livadia', category: 'history', region: 'south' },
    'vorontsov-palace': { city: 'alupka', category: 'history', region: 'south' },
    'ai-petri': { city: 'koreiz', category: 'nature', region: 'south' },
    'nikitsky-garden': { city: 'nikita', category: 'parks', region: 'south' },
    'chekhov-dacha': { city: 'gurzuf', category: 'history', region: 'south' },
    'pushkin-museum-gurzuf': { city: 'gurzuf', category: 'history', region: 'south' },
    'chersonesus': { city: 'sevastopol', category: 'history', region: 'west' },
    'balaklava-base': { city: 'balaklava', category: 'history', region: 'west' },
    'sudak-fortress': { city: 'sudak', category: 'history', region: 'east' },
    'golitsyn-trail': { city: 'novyi-svet', category: 'nature', region: 'east' },
    'dreamwood-park': { city: 'opolznevoe', category: 'kids', region: 'south' },
    'taigan-safari': { city: 'belogorsk', category: 'nature', region: 'north' },
    'atlantida-waterpark': { city: 'yalta', category: 'kids', region: 'south' },
    'sommelier-gurzuf': { city: 'gurzuf', category: 'food', region: 'south' },
    'venice-gurzuf': { city: 'gurzuf', category: 'food', region: 'south' },
    'pud-gurzuf': { city: 'gurzuf', category: 'shopping', region: 'south' },
    'yalta-embankment': { city: 'yalta', category: 'nature', region: 'south' },
    'white-dacha-yalta': { city: 'yalta', category: 'history', region: 'south' },
    'massandra-beach': { city: 'yalta', category: 'beaches', region: 'south' },
    'sevastopol-panorama': { city: 'sevastopol', category: 'history', region: 'west' },
    'malakhov-kurgan': { city: 'sevastopol', category: 'history', region: 'west' },
    'gurzuf-central-beach': { city: 'gurzuf', category: 'beaches', region: 'south' },
    'smakmarket-gurzuf': { city: 'gurzuf', category: 'shopping', region: 'south' },
    'market-gurzuf': { city: 'gurzuf', category: 'shopping', region: 'south' },
    'molbert-cafe': { city: 'gurzuf', category: 'food', region: 'south' },
    'gurzuf-park': { city: 'gurzuf', category: 'parks', region: 'south' },
    'adalary-rocks': { city: 'gurzuf', category: 'nature', region: 'south' },
    'alexander-nevsky-yalta': { city: 'yalta', category: 'history', region: 'south' },
    'yalta-aquarium': { city: 'yalta', category: 'kids', region: 'south' },
    'yalta-crocodilearium': { city: 'yalta', category: 'kids', region: 'south' },
    'sevastopol-monument-sunken-ships': { city: 'sevastopol', category: 'history', region: 'west' },
    'sevastopol-grafskaya-pristan': { city: 'sevastopol', category: 'history', region: 'west' },
    'ghost-valley': { city: 'alushta', category: 'nature', region: 'south' },
    'dzhur-dzhur': { city: 'alushta', category: 'nature', region: 'south' },
    'alushta-aquarium': { city: 'alushta', category: 'kids', region: 'south' },
    'alchak-cape': { city: 'sudak', category: 'nature', region: 'east' },
    'meganom-cape': { city: 'sudak', category: 'nature', region: 'east' },
    'sudak-beach': { city: 'sudak', category: 'beaches', region: 'east' },
    'chembalo-fortress': { city: 'balaklava', category: 'history', region: 'west' },
    'taxi-volna': { city: 'gurzuf', category: 'taxi', region: 'south' },
    'taxi-maxim': { city: 'gurzuf', category: 'taxi', region: 'south' }
};

function fixMetadata() {
    let content = fs.readFileSync(MANUAL_PLACES_FILE, 'utf8');
    let count = 0;

    for (const [id, meta] of Object.entries(majorFixes)) {
        // Regex to find the entry and replace city/category/region
        const regex = new RegExp(`(['"]?${id}['"]?\\s*:\\s*{[\\s\\S]*?})`, 'g');
        content = content.replace(regex, (match) => {
            let body = match;
            body = body.replace(/region:\s*['"][^'"]*['"]/, `region: '${meta.region}'`);
            body = body.replace(/city:\s*['"][^'"]*['"]/, `city: '${meta.city}'`);
            body = body.replace(/category:\s*['"][^'"]*['"]/, `category: '${meta.category}'`);
            count++;
            return body;
        });
    }

    fs.writeFileSync(MANUAL_PLACES_FILE, content);
    console.log(`✅ Fixed ${count} major landmarks!`);
}

fixMetadata();
