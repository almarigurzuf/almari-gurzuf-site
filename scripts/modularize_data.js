
import fs from 'fs';
import path from 'path';

const MANUAL_PLACES_FILE = './src/sections/guide/data/manual_places.js';
const REGIONS_DIR = './src/sections/guide/data/regions';

if (!fs.existsSync(REGIONS_DIR)) {
    fs.mkdirSync(REGIONS_DIR, { recursive: true });
}

function modularize() {
    console.log('📦 Modularizing data...');
    
    // We need to import the data. Since it's ES modules, we'll parse it as a string to be safe.
    const content = fs.readFileSync(MANUAL_PLACES_FILE, 'utf8');
    
    // Extract individual objects
    const entries = {};
    const regex = /['"]?([a-zA-Z0-9_-]+)['"]?\s*:\s*{\s*\n([\s\S]*?)\n\s*},/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
        const id = match[1];
        const body = match[2];
        
        // Find region
        const regionMatch = body.match(/region:\s*['"]([^'"]+)['"]/);
        const region = regionMatch ? regionMatch[1] : 'unknown';
        
        if (!entries[region]) entries[region] = {};
        entries[region][id] = body;
    }

    // Write to region files
    for (const [region, items] of Object.entries(entries)) {
        let fileContent = `export const ${region.toUpperCase()}_PLACES = {\n`;
        for (const [id, body] of Object.entries(items)) {
            fileContent += `    '${id}': {\n${body}\n    },\n`;
        }
        // Remove trailing comma and newline
        fileContent = fileContent.trimEnd().replace(/,$/, '') + '\n};\n';
        
        fs.writeFileSync(path.join(REGIONS_DIR, `${region}.js`), fileContent);
        console.log(`✅ Created regions/${region}.js with ${Object.keys(items).length} items.`);
    }

    // Create main provider.js
    const regionNames = Object.keys(entries);
    let providerContent = regionNames.map(r => `import { ${r.toUpperCase()}_PLACES } from './regions/${r}.js';`).join('\n');
    providerContent += `\n\nexport const MANUAL_PLACES = {\n`;
    providerContent += regionNames.map(r => `    ...${r.toUpperCase()}_PLACES`).join(',\n');
    providerContent += `\n};\n`;
    
    fs.writeFileSync('./src/sections/guide/data/manual_places.js', providerContent);
    console.log('✅ Updated manual_places.js as a combined entry point.');
}

modularize();
