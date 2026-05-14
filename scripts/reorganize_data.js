
import fs from 'fs';
import path from 'path';

const DATA_DIR = './src/sections/guide/data/regions';
const guideData = JSON.parse(fs.readFileSync('/tmp/guide_data.json', 'utf8'));

const regions = {
    east: 'EAST_PLACES',
    north: 'NORTH_PLACES',
    south: 'SOUTH_PLACES',
    west: 'WEST_PLACES',
    all: 'ALL_PLACES'
};

const regionFiles = {
    east: 'east.js',
    north: 'north.js',
    south: 'south.js',
    west: 'west.js',
    all: 'all.js'
};

function getCorrectRegion(place) {
    if (place.category === 'taxi' || place.region === 'all') return 'all';
    if (!place.routeDest) return place.region;

    const [lat, lon] = place.routeDest.split(',').map(Number);
    
    if (lon < 33.78) return 'west';
    if (lon > 34.55) return 'east';
    if (lat > 44.72) return 'north';
    return 'south';
}

const gurzufIds = [
    'gurzuf-central-beach',
    'venice-gurzuf',
    'adalary-rocks',
    'market-gurzuf',
    'pud-gurzuf',
    'sommelier-gurzuf',
    'molbert-cafe',
    'chekhov-dacha-gurzuf',
    'pushkin-museum-gurzuf',
    'gurzuf-park',
    'genoise-rock-gurzuf',
    'gurzuf-cat-monument'
];

const output = {
    east: {},
    north: {},
    south: {},
    west: {},
    all: {}
};

for (const id in guideData) {
    const place = guideData[id];
    
    // Manual overrides for Gurzuf
    if (gurzufIds.includes(id) || id.includes('gurzuf') || id.includes('adalary')) {
        place.city = 'gurzuf';
    }

    const newRegion = getCorrectRegion(place);
    
    if (place.city) {
        place.city = place.city.replace(/,$/, '').toLowerCase();
    }
    
    place.region = newRegion;

    const placeId = place.id;
    delete place.id;
    delete place.sourceFile;
    output[newRegion][placeId] = place;
}

function stringifyJS(obj) {
    const lines = [];
    lines.push('{');
    for (const [key, value] of Object.entries(obj)) {
        lines.push(`    '${key}': {`);
        for (const [k, v] of Object.entries(value)) {
            let valStr = '';
            if (typeof v === 'string') {
                if (v.includes('\n')) {
                    valStr = `\`${v.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\``;
                } else {
                    valStr = `'${v.replace(/'/g, "\\'")}'`;
                }
            } else if (Array.isArray(v)) {
                valStr = '[\n';
                v.forEach(item => {
                    const itemStr = JSON.stringify(item)
                        .replace(/"/g, "'")
                        .replace(/{'([^']+)'/g, "{ $1")
                        .replace(/'([^']+)'\s*:/g, '$1: ')
                        .replace(/,: /g, ', ')
                        .replace(/}/g, " }");
                    valStr += `            ${itemStr},\n`;
                });
                valStr += '        ]';
            } else {
                valStr = JSON.stringify(v);
            }
            lines.push(`        ${k}: ${valStr},`);
        }
        lines.push('    },');
    }
    lines.push('}');
    return lines.join('\n');
}

for (const region in output) {
    const places = output[region];
    const sortedIds = Object.keys(places).sort((a, b) => {
        const pA = places[a];
        const pB = places[b];
        if (pA.city !== pB.city) return (pA.city || '').localeCompare(pB.city || '');
        if (pA.category !== pB.category) return (pA.category || '').localeCompare(pB.category || '');
        return (pA.name || '').localeCompare(pB.name || '');
    });

    const sortedPlaces = {};
    sortedIds.forEach(id => sortedPlaces[id] = places[id]);

    const content = `export const ${regions[region]} = ${stringifyJS(sortedPlaces)};\n`;
    fs.writeFileSync(path.join(DATA_DIR, regionFiles[region]), content);
}
