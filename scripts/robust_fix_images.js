
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'src/sections/guide/data');
const ASSETS_DIR = path.join(ROOT_DIR, 'public/assets/guide');

async function robustFix() {
    console.log('🛠 Starting robust fix...');
    
    const photos = fs.readdirSync(ASSETS_DIR).filter(f => f.endsWith('.webp'));
    const mapping = {};
    photos.forEach(f => mapping[f.replace('.webp', '')] = `/assets/guide/${f}`);

    const dataFiles = ['manual_places.js', 'scraped_places.js', 'parsed_places.js'];

    for (const fileName of dataFiles) {
        const filePath = path.join(DATA_DIR, fileName);
        if (!fs.existsSync(filePath)) continue;

        let content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const newLines = [];
        let updated = false;

        let currentId = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Try to catch the start of an object: 'id': { or id: {
            const idMatch = line.match(/^\s*['"]?([^'":]+)['"]?\s*:\s*{\s*$/);
            
            if (idMatch) {
                currentId = idMatch[1];
                newLines.push(line);
                
                // If we have a photo for this ID, inject it immediately
                if (mapping[currentId]) {
                    newLines.push(`        image: '${mapping[currentId]}',`);
                    updated = true;
                }
                continue;
            }

            // If we are inside an object and see an existing image line, skip it (we already injected a new one)
            if (currentId && line.includes('image:') && mapping[currentId]) {
                // skip this line
                continue;
            }

            // Catch the end of an object
            if (line.trim() === '},' || line.trim() === '}') {
                currentId = null;
            }

            newLines.push(line);
        }

        if (updated) {
            fs.writeFileSync(filePath, newLines.join('\n'));
            console.log(`✅ Robustly fixed ${fileName}`);
        }
    }
}

robustFix().catch(err => console.error(err));
