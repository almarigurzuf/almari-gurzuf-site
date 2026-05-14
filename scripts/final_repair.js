
import fs from 'fs';
import path from 'path';

const DATA_DIR = './src/sections/guide/data/regions';
const guideData = JSON.parse(fs.readFileSync('/tmp/guide_data.json', 'utf8'));

const regions = { east: 'EAST_PLACES', north: 'NORTH_PLACES', south: 'SOUTH_PLACES', west: 'WEST_PLACES', all: 'ALL_PLACES' };
const regionFiles = { east: 'east.js', north: 'north.js', south: 'south.js', west: 'west.js', all: 'all.js' };

const cityToRegion = {
    'yalta': 'south', 'gurzuf': 'south', 'alushta': 'south', 'alupka': 'south', 'gaspra': 'south', 'livadia': 'south', 'massandra': 'south', 'nikita': 'south', 'koreiz': 'south', 'partenit': 'south', 'foros': 'south', 'opolznevoe': 'south', 'luchistoe': 'south', 'malorechenskoe': 'south', 'rybachye': 'south', 'zelenogorye': 'south', 'utes': 'south',
    'sevastopol': 'west', 'balaklava': 'west', 'evpatoria': 'west', 'saki': 'west', 'inkerman': 'west', 'laspi': 'west', 'tarkhankut': 'west', 'mezhvodnoe': 'west', 'olenevka': 'west', 'chernomorskoe': 'west',
    'sudak': 'east', 'feodosiya': 'east', 'kerch': 'east', 'koktebel': 'east', 'novyi-svet': 'east', 'staryj-krym': 'east', 'shhyolkino': 'east', 'ordzhonikidze': 'east',
    'simferopol': 'north', 'bakhchisarai': 'north', 'belogorsk': 'north', 'perevalnoe': 'north', 'nauchnyj': 'north', 'mramornoe': 'north', 'sokolinoe': 'north',
};

const catKeywords = {
    food: ['ресторан', 'кафе', 'бар', 'винодельня', 'гастро', 'стейк', 'кухня', 'пицца', 'кофейня', 'трактир', 'чебуречная', 'столовая', 'пекарня', 'паб'],
    shopping: ['рынок', 'магазин', 'супермаркет', 'торговый', 'тц', 'пуд', 'яблоко', 'без-цен', 'пассаж', 'универмаг'],
    beaches: ['пляж', 'набережная', 'берег', 'бухта'],
    nature: ['гора', 'скала', 'озеро', 'водопад', 'каньон', 'тропа', 'мыс', 'урочище', 'вершина', 'пещера', 'хребет', 'залив', 'источник', 'родник'],
    history: ['дворец', 'музей', 'крепость', 'храм', 'собор', 'мечеть', 'усадьба', 'руины', 'башня', 'замок', 'дача', 'мемориал', 'памятник', 'форт', 'цитадель', 'кенасса', 'синагога', 'монастырь'],
    parks: ['парк', 'сад', 'аквапарк', 'сквер', 'дендрарий', 'заповедник'],
    entertainment: ['дельфинарий', 'аквариум', 'театр', 'аттракцион', 'ферма', 'ранчо', 'цирк', 'прогулки', 'дайвинг', 'экскурсия'],
    kids: ['детский', 'сказка', 'зоопарк', 'сафари', 'диспарк', 'лукоморье', 'крокодил'],
};

const cityKeywords = {
    'yalta': ['ялта', 'ялтин'], 'gurzuf': ['гурзуф'], 'alushta': ['алушта', 'алуштин'], 'alupka': ['алупка'], 'gaspra': ['гаспр'], 'livadia': ['ливадия'], 'massandra': ['массандра'], 'nikita': ['никит'], 'koreiz': ['кореиз'], 'partenit': ['партенит'], 'foros': ['форос'], 'opolznevoe': ['оползнев'], 'luchistoe': ['лучист'], 'malorechenskoe': ['малореченск'], 'zelenogorye': ['зеленогорь'], 'utes': ['утес'],
    'sevastopol': ['севастополь', 'севастопольск'], 'balaklava': ['балаклава'], 'evpatoria': ['евпатория'], 'saki': ['саки', 'сакск'], 'inkerman': ['инкерман'], 'laspi': ['ласпи'],
    'sudak': ['судак'], 'feodosiya': ['феодосия', 'феодосийск'], 'kerch': ['керчь'], 'koktebel': ['коктебель'], 'novyi-svet': ['новый свет'], 'staryj-krym': ['старый крым'], 'shhyolkino': ['щелкино'],
    'simferopol': ['симферополь'], 'bakhchisarai': ['бахчисарай'], 'belogorsk': ['белогорск'], 'perevalnoe': ['перевальн'], 'nauchnyj': ['научный'], 'mramornoe': ['мраморн'], 'sokolinoe': ['соколино'],
};

const output = { east: {}, north: {}, south: {}, west: {}, all: {} };

for (const id in guideData) {
    const p = guideData[id];
    let name = (p.name || '').toLowerCase();
    let type = (p.type || '').toLowerCase();
    let desc = (p.desc || '').toLowerCase();

    // 1. Determine City
    let currentCity = p.city || '';
    for (const [city, keywords] of Object.entries(cityKeywords)) {
        if (keywords.some(k => name.includes(k) || id.includes(city))) {
            currentCity = city;
            break;
        }
    }
    p.city = currentCity;

    // 2. Determine Region
    let currentRegion = cityToRegion[p.city] || p.region || 'south';
    p.region = currentRegion;

    // 3. Determine Category (Heuristic)
    let currentCat = p.category;
    let foundCat = false;
    // Specific priority for food and shopping
    for (const cat of ['food', 'shopping', 'kids', 'entertainment', 'beaches', 'parks', 'history', 'nature']) {
        if (catKeywords[cat].some(k => name.includes(k) || type.includes(k))) {
            currentCat = cat;
            foundCat = true;
            break;
        }
    }
    // Final check for nature if nothing else matches but it's a natural object
    if (!foundCat && catKeywords.nature.some(k => desc.includes(k))) {
        currentCat = 'nature';
    }
    p.category = currentCat;

    // Remove processing tags
    const placeId = p.id;
    delete p.id;
    delete p.sourceFile;
    
    if (p.category === 'taxi') {
        output.all[placeId] = p;
    } else {
        output[currentRegion][placeId] = p;
    }
}

function stringifyJS(obj) {
    const lines = [];
    lines.push('{');
    for (const [key, value] of Object.entries(obj)) {
        lines.push(`    '${key}': {`);
        for (const [k, v] of Object.entries(value)) {
            let valStr = '';
            if (typeof v === 'string') {
                if (v.includes('\n')) valStr = `\`${v.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\``;
                else valStr = `'${v.replace(/'/g, "\\'")}'`;
            } else if (Array.isArray(v)) {
                valStr = '[\n';
                v.forEach(item => {
                    const itemStr = JSON.stringify(item).replace(/"/g, "'").replace(/{'([^']+)'/g, "{ $1").replace(/'([^']+)'\s*:/g, '$1: ').replace(/,: /g, ', ').replace(/}/g, " }");
                    valStr += `            ${itemStr},\n`;
                });
                valStr += '        ]';
            } else valStr = JSON.stringify(v);
            lines.push(`        ${k}: ${valStr},`);
        }
        lines.push('    },');
    }
    lines.push('}');
    return lines.join('\n');
}

for (const reg in output) {
    const places = output[reg];
    const sortedIds = Object.keys(places).sort((a, b) => {
        const pA = places[a], pB = places[b];
        if (pA.city !== pB.city) return (pA.city || '').localeCompare(pB.city || '');
        if (pA.category !== pB.category) return (pA.category || '').localeCompare(pB.category || '');
        return (pA.name || '').localeCompare(pB.name || '');
    });
    const sortedPlaces = {};
    sortedIds.forEach(id => sortedPlaces[id] = places[id]);
    const content = `export const ${regions[reg]} = ${stringifyJS(sortedPlaces)};\n`;
    fs.writeFileSync(path.join(DATA_DIR, regionFiles[reg]), content);
}
console.log('✅ Final Repair Complete!');
