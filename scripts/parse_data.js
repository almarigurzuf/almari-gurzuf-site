
import fs from 'fs';
import path from 'path';

const DATA_DIR = './src/sections/guide/data/regions';
const files = ['east.js', 'north.js', 'south.js', 'west.js', 'all.js'];

const allData = {};

function parseFile(filename) {
    const content = fs.readFileSync(path.join(DATA_DIR, filename), 'utf8');
    // Extract the object content between { and };
    const match = content.match(/export const [A-Z_]+ = (\{[\s\S]*\});?\s*$/);
    if (!match) return;

    // We can't easily eval because of possible imports or complex structure, 
    // but these files seem to be plain objects.
    // Let's use a trick: wrap in a function that returns it.
    try {
        const objStr = match[1];
        // Convert to commonjs-like to eval
        const fn = new Function('return ' + objStr);
        const data = fn();
        for (const [id, place] of Object.entries(data)) {
            place.id = id;
            place.sourceFile = filename;
            allData[id] = place;
        }
    } catch (e) {
        console.error(`Error parsing ${filename}:`, e.message);
    }
}

files.forEach(parseFile);

console.log(JSON.stringify(allData, null, 2));
