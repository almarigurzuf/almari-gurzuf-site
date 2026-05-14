const fs = require('fs');
const content = fs.readFileSync('/Users/vladkozjaevgmail.com/Desktop/AI/Project/site/src/sections/guide/data/manual_places.js', 'utf8');

const keyRegex = /^\s*'([^']+)':/gm;
let match;
const keys = [];
const duplicates = [];
const seen = new Set();

while ((match = keyRegex.exec(content)) !== null) {
    const key = match[1];
    if (seen.has(key)) {
        duplicates.push(key);
    }
    seen.add(key);
}

if (duplicates.length > 0) {
    console.log('Found duplicate keys:');
    console.log([...new Set(duplicates)].join(', '));
} else {
    console.log('No duplicates found.');
}
