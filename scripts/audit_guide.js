
import fs from 'fs';

const guideData = JSON.parse(fs.readFileSync('/tmp/guide_data.json', 'utf8'));

const mismatches = [];

const cityKeywords = {
    'yalta': ['ялта', 'ялтин'],
    'gurzuf': ['гурзуф'],
    'alushta': ['алушта', 'алуштин'],
    'sevastopol': ['севастополь', 'севастопольск'],
    'balaklava': ['балаклава'],
    'evpatoria': ['евпатория'],
    'sudak': ['судак'],
    'kerch': ['керчь'],
    'feodosiya': ['феодосия', 'феодосийск'],
    'bakhchisarai': ['бахчисарай'],
    'simferopol': ['симферополь'],
    'alupka': ['алупка'],
    'saki': ['саки', 'сакск'],
    'inkerman': ['инкерман'],
    'massandra': ['массандра'],
};

for (const id in guideData) {
    const p = guideData[id];
    const name = (p.name || '').toLowerCase();
    const city = (p.city || '').toLowerCase();
    const category = (p.category || '').toLowerCase();
    const type = (p.type || '').toLowerCase();

    // 1. Check City in Name
    for (const [key, keywords] of Object.entries(cityKeywords)) {
        if (keywords.some(k => name.includes(k)) && city !== key) {
            // Allow sub-cities like Gurzuf inside Yalta region, but flag for review
            if (key === 'gurzuf' && city === 'yalta') continue; 
            if (key === 'yalta' && city === 'gurzuf') continue; 
            mismatches.push(`[City Match] ${id}: Name has "${key}" but City is "${city}"`);
        }
    }

    // 2. Check Category Logic
    if (category === 'history' && (name.includes('пляж') || type.includes('пляж'))) {
        mismatches.push(`[Category Match] ${id}: Category is "history" but name/type says "beach"`);
    }
    if (category === 'beaches' && (name.includes('дворец') || name.includes('музей'))) {
        mismatches.push(`[Category Match] ${id}: Category is "beaches" but name says "palace/museum"`);
    }
    if (category === 'nature' && (name.includes('ресторан') || name.includes('кафе'))) {
        mismatches.push(`[Category Match] ${id}: Category is "nature" but name is a restaurant`);
    }
    if (category === 'food' && (type.includes('пляж') || type.includes('парк'))) {
         if (!name.includes('кафе') && !name.includes('ресторан')) {
            mismatches.push(`[Category Match] ${id}: Category is "food" but type says "${type}"`);
         }
    }
}

console.log(mismatches.join('\n'));
