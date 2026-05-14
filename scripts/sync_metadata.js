
import fs from 'fs';
import path from 'path';

const FLAT_FILE = './scratch/all_places_flat.txt';
const MANUAL_PLACES_FILE = './src/sections/guide/data/manual_places.js';

const regionMap = {
    'YALTA': 'south',
    'GURZUF': 'south',
    'ALUPKA': 'south',
    'GASPRA': 'south',
    'KOREIZ': 'south',
    'MASSANDRA': 'south',
    'LIVADIA': 'south',
    'FOROS': 'south',
    'ALUSHTA': 'south',
    'PARTENIT': 'south',
    'LUCHISTOE': 'south',
    'MALORECHENSKOE': 'south',
    'SEVASTOPOL': 'west',
    'BALAKLAVA': 'west',
    'LASPI': 'west',
    'EVPATORIA': 'west',
    'CHERNOMORSKOE': 'west',
    'OLENEVKA': 'west',
    'SAKI': 'west',
    'SUDAK': 'east',
    'NOVYI SVET': 'east',
    'FEODOSIYA': 'east',
    'KOKTEBEL': 'east',
    'KERCH': 'east',
    'SIMFEROPOL': 'north',
    'BAKHCHISARAI': 'north',
    'BELOGORSK': 'north',
    'MRAMORNOE': 'north',
    'NAUCHNYJ': 'north',
    'PEREVALNOE': 'north',
    'CRIMEA': 'south', // Default for general Crimea items
    'ALL': 'south' // Default
};

async function syncMetadata() {
    console.log('🔄 Syncing metadata from flat file...');

    const flatContent = fs.readFileSync(FLAT_FILE, 'utf8');
    const lines = flatContent.split('\n');
    const metadata = {};

    lines.forEach(line => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 4) {
            const city = parts[0];
            const category = parts[1];
            const id = parts[3];
            
            metadata[id] = {
                city: city.toLowerCase(),
                category: category.toLowerCase(),
                region: regionMap[city] || 'south'
            };
        }
    });

    let manualContent = fs.readFileSync(MANUAL_PLACES_FILE, 'utf8');
    
    // Pattern to match an entry and its contents until the closing brace
    // We use a more robust approach: split by entries
    const entries = manualContent.split(/\n\s*['"]?([a-zA-Z0-9_-]+)['"]?\s*:\s*{\s*\n/);
    
    let newContent = entries[0]; // Header
    
    for (let i = 1; i < entries.length; i += 2) {
        const id = entries[i];
        let body = entries[i+1];
        
        // Find where this entry ends (the next entry starts or the end of object)
        // This is tricky because body contains the rest of the file.
        // We need to find the first }; that is not followed by a comma and another ID?
        // Actually, in manual_places.js, each entry ends with }, or };
        
        const endOfEntryMatch = body.match(/^([\s\S]*?)\n\s*},/m);
        let entryContent = "";
        let remainder = "";
        
        if (endOfEntryMatch) {
            entryContent = endOfEntryMatch[1];
            remainder = body.substring(endOfEntryMatch[0].length);
        } else {
            // Last entry?
            const lastMatch = body.match(/^([\s\S]*?)\n\s*}/m);
            if (lastMatch) {
                entryContent = lastMatch[1];
                remainder = body.substring(lastMatch[0].length);
            }
        }

        if (metadata[id]) {
            // Check if properties already exist
            if (!entryContent.includes('region:')) {
                entryContent += `\n        region: '${metadata[id].region}',`;
            }
            if (!entryContent.includes('city:')) {
                entryContent += `\n        city: '${metadata[id].city}',`;
            }
            if (!entryContent.includes('category:')) {
                entryContent += `\n        category: '${metadata[id].category}',`;
            }
        }

        newContent += `\n    '${id}': {\n${entryContent}\n    },` + remainder;
        // Wait, the remainder will be processed in the next iteration. 
        // This logic is slightly flawed because it appends remainder every time.
        // Let's refine.
    }

    // Better approach: use regex replace with callback
    let updatedContent = manualContent.replace(/\n\s*['"]?([a-zA-Z0-9_-]+)['"]?\s*:\s*{\s*\n([\s\S]*?)\n\s*},/g, (match, id, body) => {
        if (metadata[id]) {
            let newBody = body;
            if (!newBody.includes('region:')) {
                newBody += `\n        region: '${metadata[id].region}',`;
            }
            if (!newBody.includes('city:')) {
                newBody += `\n        city: '${metadata[id].city}',`;
            }
            if (!newBody.includes('category:')) {
                newBody += `\n        category: '${metadata[id].category}',`;
            }
            return `\n    '${id}': {\n${newBody}\n    },`;
        }
        return match;
    });

    // Also handle the very last entry which might end in };
    updatedContent = updatedContent.replace(/\n\s*['"]?([a-zA-Z0-9_-]+)['"]?\s*:\s*{\s*\n([\s\S]*?)\n\s*}\s*;\s*$/g, (match, id, body) => {
        if (metadata[id]) {
            let newBody = body;
            if (!newBody.includes('region:')) {
                newBody += `\n        region: '${metadata[id].region}',`;
            }
            if (!newBody.includes('city:')) {
                newBody += `\n        city: '${metadata[id].city}',`;
            }
            if (!newBody.includes('category:')) {
                newBody += `\n        category: '${metadata[id].category}',`;
            }
            return `\n    '${id}': {\n${newBody}\n    }\n};`;
        }
        return match;
    });

    fs.writeFileSync(MANUAL_PLACES_FILE, updatedContent);
    console.log('✅ Metadata synced successfully!');
}

syncMetadata().catch(console.error);
