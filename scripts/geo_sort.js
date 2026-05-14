import fs from 'fs';
import path from 'path';

const DATA_DIR = '/Users/vladkozjaevgmail.com/Desktop/AI/Project/site/src/sections/guide/data/regions/';
const FILES = ['south.js', 'north.js', 'east.js', 'west.js'];

const CITY_COORDS = {
    // South
    'gurzuf': { lat: 44.5428, lon: 34.2811, region: 'south' },
    'yalta': { lat: 44.4952, lon: 34.1663, region: 'south' },
    'alushta': { lat: 44.6688, lon: 34.4018, region: 'south' },
    'alupka': { lat: 44.4195, lon: 34.0487, region: 'south' },
    'koreiz': { lat: 44.4312, lon: 34.0863, region: 'south' },
    'massandra': { lat: 44.5108, lon: 34.1864, region: 'south' },
    'gaspra': { lat: 44.4361, lon: 34.1105, region: 'south' },
    'luchistoe': { lat: 44.7369, lon: 34.4024, region: 'south' },
    'laspi': { lat: 44.4172, lon: 33.7088, region: 'south' },
    'malorechenskoe': { lat: 44.7570, lon: 34.5583, region: 'south' },
    'partenit': { lat: 44.5772, lon: 34.3444, region: 'south' },
    'foros': { lat: 44.3916, lon: 33.7850, region: 'south' },
    'sokolinoe': { lat: 44.5516, lon: 33.9576, region: 'south' },
    'zelenogorye': { lat: 44.8733, lon: 34.7200, region: 'south' },

    // North
    'simferopol': { lat: 44.9521, lon: 34.1024, region: 'north' },
    'bakhchisarai': { lat: 44.7479, lon: 33.8617, region: 'north' },
    'belogorsk': { lat: 45.0538, lon: 34.6019, region: 'north' },
    'mramornoe': { lat: 44.8142, lon: 34.2764, region: 'north' },
    'perevalnoe': { lat: 44.8464, lon: 34.3219, region: 'north' },
    'nauchnyj': { lat: 44.7289, lon: 34.0155, region: 'north' },

    // West
    'sevastopol': { lat: 44.6166, lon: 33.5254, region: 'west' },
    'balaklava': { lat: 44.5000, lon: 33.6000, region: 'west' },
    'evpatoria': { lat: 45.1939, lon: 33.3682, region: 'west' },
    'olenevka': { lat: 45.3813, lon: 32.5332, region: 'west' },
    'saki': { lat: 45.1336, lon: 33.5772, region: 'west' },
    'chernomorskoe': { lat: 45.5033, lon: 32.7000, region: 'west' },

    // East
    'sudak': { lat: 44.8505, lon: 34.9763, region: 'east' },
    'feodosiya': { lat: 45.0321, lon: 35.3789, region: 'east' },
    'noviy_svet': { lat: 44.8294, lon: 34.9125, region: 'east' },
    'kerch': { lat: 45.3619, lon: 36.4711, region: 'east' },
    'koktebel': { lat: 44.9608, lon: 35.2444, region: 'east' },
    'shhyolkino': { lat: 45.4269, lon: 35.8197, region: 'east' },
    'staryj-krym': { lat: 45.0294, lon: 35.0933, region: 'east' },
};

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
}

function findClosestCity(lat, lon) {
    let closestCity = null;
    let minDistance = Infinity;

    for (const [city, coords] of Object.entries(CITY_COORDS)) {
        const dist = getDistance(lat, lon, coords.lat, coords.lon);
        if (dist < minDistance) {
            minDistance = dist;
            closestCity = city;
        }
    }
    return { city: closestCity, region: CITY_COORDS[closestCity].region, distance: minDistance };
}

let allPlaces = {};

FILES.forEach(file => {
    const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
    const match = content.match(/export const \w+ = (\{[\s\S]*?\});$/m);
    
    if (match) {
        try {
            const obj = new Function(`return ${match[1]}`)();
            Object.assign(allPlaces, obj);
        } catch (e) {
            console.error(`Error parsing ${file}:`, e);
            // Fallback JSON.parse if the object was saved as JSON-like string
            try {
                const obj = JSON.parse(match[1]);
                Object.assign(allPlaces, obj);
            } catch (e2) {
                console.error(`Error with fallback JSON parse ${file}:`, e2);
            }
        }
    }
});

let finalPlaces = { south: {}, north: {}, west: {}, east: {} };

Object.entries(allPlaces).forEach(([id, place]) => {
    // Determine category based on type/desc
    let cat = place.category || 'history';
    const desc = (place.desc || '').toLowerCase();
    const type = (place.type || '').toLowerCase();
    const name = (place.name || '').toLowerCase();

    if (type.includes('природа') || type.includes('гора') || type.includes('скала') || type.includes('пещера') || name.includes('гора') || name.includes('скала') || name.includes('пещера')) cat = 'nature';
    if (type.includes('пляж') || name.includes('пляж')) cat = 'beaches';
    if (type.includes('еда') || type.includes('ресторан') || type.includes('кафе') || type.includes('бар') || name.includes('ресторан') || name.includes('кафе')) cat = 'food';
    if (type.includes('магазин') || type.includes('рынок') || type.includes('супермаркет') || name.includes('рынок') || name.includes('пуд') || name.includes('яблоко')) cat = 'shops';
    if (type.includes('развлечения') || type.includes('дельфинарий') || type.includes('аквапарк') || name.includes('дельфинарий') || name.includes('аквапарк')) cat = 'entertainment';
    if (type.includes('детям') || type.includes('парк миниатюр') || name.includes('парк львов') || name.includes('зоопарк')) cat = 'kids';

    // Set category
    place.category = cat;

    // Use coordinates if available
    let assignedCity = place.city;
    let assignedRegion = place.region;

    if (place.routeDest) {
        // Handle routes like "~44.955,34.140"
        let coordsStr = place.routeDest;
        if (coordsStr.includes('rtext=')) {
            const match = coordsStr.match(/rtext=~?([\d\.]+),([\d\.]+)/);
            if (match) {
                coordsStr = `${match[1]},${match[2]}`;
            }
        }
        coordsStr = coordsStr.replace('~', '').replace(' ', '');
        
        const [latStr, lonStr] = coordsStr.split(',');
        const lat = parseFloat(latStr);
        const lon = parseFloat(lonStr);
        
        if (!isNaN(lat) && !isNaN(lon)) {
            const result = findClosestCity(lat, lon);
            // Only reassign if distance is reasonable (e.g. < 40km), otherwise keep original
            // Actually, let's just assign it to the closest city.
            assignedCity = result.city;
            assignedRegion = result.region;
        }
    }

    // Special forced keywords override
    if (desc.includes('гурзуф') || name.includes('гурзуф')) { assignedCity = 'gurzuf'; assignedRegion = 'south'; }
    if (name.includes('симферопол') || desc.includes('симферопол')) { assignedCity = 'simferopol'; assignedRegion = 'north'; }
    if (name.includes('севастопол')) { assignedCity = 'sevastopol'; assignedRegion = 'west'; }
    if (name.includes('балаклав')) { assignedCity = 'balaklava'; assignedRegion = 'west'; }
    if (name.includes('алушт')) { assignedCity = 'alushta'; assignedRegion = 'south'; }
    if (name.includes('ялт')) { assignedCity = 'yalta'; assignedRegion = 'south'; }
    if (name.includes('судак')) { assignedCity = 'sudak'; assignedRegion = 'east'; }
    if (name.includes('евпатори')) { assignedCity = 'evpatoria'; assignedRegion = 'west'; }
    if (name.includes('феодоси')) { assignedCity = 'feodosiya'; assignedRegion = 'east'; }
    if (name.includes('балаклава')) { assignedCity = 'balaklava'; assignedRegion = 'west'; }

    // If still missing, default to south/yalta
    if (!assignedCity || !assignedRegion) {
        assignedCity = 'yalta';
        assignedRegion = 'south';
    }

    place.city = assignedCity;
    place.region = assignedRegion;

    finalPlaces[assignedRegion][id] = place;
});

const REGION_TO_VAR = {
    south: 'SOUTH_PLACES',
    north: 'NORTH_PLACES',
    west: 'WEST_PLACES',
    east: 'EAST_PLACES'
};

// Formatter to stringify like standard JS object (not strictly JSON)
function stringifyObject(obj) {
    let entries = Object.entries(obj).map(([key, val]) => {
        let valStr = JSON.stringify(val, null, 4);
        return `    '${key}': ${valStr.split('\\n').join('\\n').replace(/\n/g, '\n    ')}`;
    });
    return `{\n${entries.join(',\n')}\n}`;
}

Object.entries(finalPlaces).forEach(([region, places]) => {
    const sortedEntries = Object.entries(places).sort((a, b) => {
        const cityA = a[1].city || '';
        const cityB = b[1].city || '';
        if (cityA !== cityB) return cityA.localeCompare(cityB);
        return a[1].name.localeCompare(b[1].name);
    });

    const sortedObj = Object.fromEntries(sortedEntries);
    let content = `export const ${REGION_TO_VAR[region]} = ${stringifyObject(sortedObj)};\n`;
    
    fs.writeFileSync(path.join(DATA_DIR, `${region}.js`), content);
    console.log(`Saved ${region}.js with ${sortedEntries.length} entries.`);
});
