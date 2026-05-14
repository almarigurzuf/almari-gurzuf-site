
import fs from 'fs';
import path from 'path';

const parsedPath = './src/sections/guide/data/parsed_places.js';

// Read parsed_places.js
let content = fs.readFileSync(parsedPath, 'utf8');

// Use regex to find the object content
const match = content.match(/export const PARSED_PLACES = (\{[\s\S]*\});/);
if (!match) {
    console.error('Could not find PARSED_PLACES object');
    process.exit(1);
}

const parsedPlaces = eval('(' + match[1] + ')');
const cleanedPlaces = {};
let removedCount = 0;

Object.entries(parsedPlaces).forEach(([id, p]) => {
    if (p.name && p.name.match(/^Место \d+$/)) {
        removedCount++;
        return;
    }
    cleanedPlaces[id] = p;
});

const newContent = `export const PARSED_PLACES = ${JSON.stringify(cleanedPlaces, null, 4)};\n`;
fs.writeFileSync(parsedPath, newContent);

console.log(`Removed ${removedCount} placeholder entries from parsed_places.js`);
console.log(`Remaining entries: ${Object.keys(cleanedPlaces).length}`);
