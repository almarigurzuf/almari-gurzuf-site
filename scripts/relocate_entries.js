
import fs from 'fs';
import path from 'path';

const DATA_DIR = './src/sections/guide/data/regions';

const moves = {
    'chersonesus': { from: 'south.js', to: 'west.js' },
    'balaklava-base': { from: 'south.js', to: 'west.js' },
    'sudak-fortress': { from: 'south.js', to: 'east.js' },
    'golitsyn-trail': { from: 'south.js', to: 'east.js' },
    'taigan-safari': { from: 'south.js', to: 'north.js' },
};

function relocate() {
    // 1. Read all files
    const files = ['south.js', 'west.js', 'east.js', 'north.js'];
    const contents = {};
    files.forEach(f => {
        contents[f] = fs.readFileSync(path.join(DATA_DIR, f), 'utf8');
    });

    for (const [id, move] of Object.entries(moves)) {
        console.log(`📦 Moving ${id} from ${move.from} to ${move.to}...`);
        
        // Extract object from source
        const regex = new RegExp(`(['"]?${id}['"]?\\s*:\\s*{[\\s\\S]*?}),?\\n(?=\\s*['"]?[a-zA-Z0-9_-]+['"]?\\s*:\\s*{|\\s*};)`, 'g');
        const match = contents[move.from].match(regex);
        
        if (match) {
            let body = match[0];
            // Remove from source
            contents[move.from] = contents[move.from].replace(regex, '');
            
            // Fix region in body
            const targetRegion = move.to.replace('.js', '');
            body = body.replace(/region:\s*['"][^'"]*['"]/, `region: '${targetRegion}'`);
            
            // Add to destination (before closing brace)
            contents[move.to] = contents[move.to].replace(/\s*};\s*$/, `,\n    ${body}\n};`);
            console.log(`✅ Moved ${id}.`);
        } else {
            console.log(`❌ Could not find ${id} in ${move.from}.`);
        }
    }

    // Write back
    files.forEach(f => {
        // Cleanup trailing commas and double commas
        let c = contents[f];
        c = c.replace(/,\s*,/g, ',');
        c = c.replace(/{\s*,/g, '{');
        fs.writeFileSync(path.join(DATA_DIR, f), c);
    });
}

relocate();
