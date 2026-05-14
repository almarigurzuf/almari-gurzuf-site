import fs from 'fs';
import path from 'path';

const DATA_DIR = '/Users/vladkozjaevgmail.com/Desktop/AI/Project/site/src/sections/guide/data/regions/';
const FILES = ['south.js', 'north.js', 'east.js', 'west.js'];

// City to Region mapping
const CITY_TO_REGION = {
    // South
    'gurzuf': 'south', 'alushta': 'south', 'yalta': 'south', 'alupka': 'south',
    'koreiz': 'south', 'massandra': 'south', 'gaspra': 'south', 'luchistoe': 'south',
    'laspi': 'south', 'malorechenskoe': 'south', 'partenit': 'south', 'foros': 'south',
    'sokolinoe': 'south', 'zelenogorye': 'south',
    // North
    'simferopol': 'north', 'bakhchisarai': 'north', 'belogorsk': 'north',
    'mramornoe': 'north', 'perevalnoe': 'north', 'nauchnyj': 'north',
    // West
    'sevastopol': 'west', 'balaklava': 'west', 'evpatoria': 'west',
    'olenevka': 'west', 'saki': 'west', 'chernomorskoe': 'west',
    // East
    'sudak': 'east', 'feodosiya': 'east', 'noviy_svet': 'east',
    'kerch': 'east', 'koktebel': 'east', 'shhyolkino': 'east', 'staryj-krym': 'east'
};

// Geofencing (rough bounding boxes)
function getRegionFromCoords(lat, lon) {
    if (lon > 34.8) return 'east';
    if (lon < 33.7) return 'west';
    if (lat > 44.8) return 'north';
    return 'south';
}

let allPlaces = {};

// 1. Load everything
FILES.forEach(file => {
    const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
    // Extract the object content using regex (risky but okay for JS export files)
    const match = content.match(/export const \w+ = (\{[\s\S]*\});/);
    if (match) {
        try {
            // Evaluated as JSON-ish (actually we need to parse JS object)
            // Using a simple eval-like approach or just parsing with JSON5 if available
            // Since it's a script, I'll use a trick: wrap in () and replace newlines/tabs
            const objStr = match[1]
                .replace(/([a-zA-Z0-9_-]+):/g, '"$1":') // keys to quotes
                .replace(/'/g, '"') // single to double quotes
                .replace(/`([^`]*)`/g, (m, p1) => JSON.stringify(p1)) // backticks to quotes
                .replace(/,(\s*[\]\}])/g, '$1'); // trailing commas
            
            // Note: This regex-based JSON conversion is brittle. 
            // Better to use a proper JS parser or just manual extraction.
            // I'll use a more robust way: read the file and use Function() to get the object.
            const obj = new Function(`const x = ${match[1]}; return x;`)();
            Object.assign(allPlaces, obj);
        } catch (e) {
            console.error(`Error parsing ${file}:`, e);
        }
    }
});

console.log(`Loaded ${Object.keys(allPlaces).length} places.`);

// 2. Re-categorize and Re-region
let final = {
    south: {},
    north: {},
    west: {},
    east: {}
};

Object.entries(allPlaces).forEach(([id, place]) => {
    let region = place.region || 'south';
    
    // Check coordinates
    if (place.routeDest) {
        const [lat, lon] = place.routeDest.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lon)) {
            region = getRegionFromCoords(lat, lon);
        }
    } else if (place.city && CITY_TO_REGION[place.city]) {
        region = CITY_TO_REGION[place.city];
    }
    
    // Safety check for specific cities that might be in wrong regions
    if (place.city === 'gurzuf') region = 'south';
    if (place.city === 'sudak') region = 'east';
    if (place.city === 'feodosiya') region = 'east';
    if (place.city === 'sevastopol') region = 'west';
    if (place.city === 'simferopol') region = 'north';
    if (place.city === 'bakhchisarai') region = 'north';

    place.region = region;
    final[region][id] = place;
});

// 3. Write back
const REGION_TO_VAR = {
    south: 'SOUTH_PLACES',
    north: 'NORTH_PLACES',
    west: 'WEST_PLACES',
    east: 'EAST_PLACES'
};

Object.entries(final).forEach(([region, places]) => {
    // Sort by city and then by name
    const sortedEntries = Object.entries(places).sort((a, b) => {
        const cityA = a[1].city || '';
        const cityB = b[1].city || '';
        if (cityA !== cityB) return cityA.localeCompare(cityB);
        return a[1].name.localeCompare(b[1].name);
    });

    const sortedObj = Object.fromEntries(sortedEntries);
    
    let content = `export const ${REGION_TO_VAR[region]} = ${JSON.stringify(sortedObj, null, 4)};`;
    // Post-process to restore some formatting (backticks for desc if needed, etc)
    // Actually, JSON.stringify is fine for now, I'll manually check the output.
    
    fs.writeFileSync(path.join(DATA_DIR, `${region}.js`), content);
    console.log(`Saved ${region}.js with ${sortedEntries.length} entries.`);
});
