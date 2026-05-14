
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'src/sections/guide/data');
const ASSETS_DIR = path.join(ROOT_DIR, 'public/assets/guide');

async function masterFix() {
    console.log('🧹 Starting Master Data Cleanup...');
    
    const photos = fs.readdirSync(ASSETS_DIR).filter(f => f.endsWith('.webp'));
    const mapping = {};
    photos.forEach(f => mapping[f.replace('.webp', '')] = `/assets/guide/${f}`);

    const dataFiles = ['manual_places.js', 'scraped_places.js'];

    for (const fileName of dataFiles) {
        const filePath = path.join(DATA_DIR, fileName);
        if (!fs.existsSync(filePath)) continue;

        let content = fs.readFileSync(filePath, 'utf8');
        
        // 1. Remove ALL existing image properties to start fresh
        // Matches "image": "...", 'image': '...', image: '...' with any quotes and commas
        content = content.replace(/\s*['"]?image['"]?\s*:\s*['"][^'"]*['"]\s*,?/g, '');

        // 2. Now inject new image properties at the beginning of each object
        const lines = content.split('\n');
        const finalLines = [];
        let updated = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            finalLines.push(line);

            // Match ID line at the start of an object
            const idMatch = line.match(/^\s*['"]?([^'":]+)['"]?\s*:\s*{\s*$/);
            if (idMatch) {
                const id = idMatch[1];
                if (mapping[id]) {
                    finalLines.push(`        image: '${mapping[id]}',`);
                    updated = true;
                }
            }
        }

        if (updated) {
            fs.writeFileSync(filePath, finalLines.join('\n'));
            console.log(`✨ Master cleaned and updated ${fileName}`);
        }
    }
}

masterFix().catch(err => console.error(err));
