
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'src/sections/guide/data');
const ASSETS_DIR = path.join(ROOT_DIR, 'public/assets/guide');

async function auditImages() {
    const dataFiles = ['manual_places.js', 'scraped_places.js', 'parsed_places.js'];
    const report = [];
    const missingPhotos = [];
    const missingInCode = [];
    
    // Get list of existing webp files
    const existingPhotos = fs.readdirSync(ASSETS_DIR).filter(f => f.endsWith('.webp'));

    for (const fileName of dataFiles) {
        const filePath = path.join(DATA_DIR, fileName);
        if (!fs.existsSync(filePath)) continue;

        const content = fs.readFileSync(filePath, 'utf8');
        
        // Match IDs and their image property
        // This is a rough regex to find objects
        const objectMatches = content.matchAll(/['"]([^'"]+)['"]:\s*{([\s\S]*?)}/g);
        
        for (const match of objectMatches) {
            const id = match[1];
            const body = match[2];
            
            // Skip top level keys like MANUAL_PLACES
            if (id === 'MANUAL_PLACES' || id === 'SCRAPED_PLACES' || id === 'PARSED_PLACES') continue;

            const imageMatch = body.match(/image:\s*['"]([^'"]+)['"]/);
            const imageNameMatch = body.match(/name:\s*['"]([^'"]+)['"]/);
            const name = imageNameMatch ? imageNameMatch[1] : id;

            if (!imageMatch) {
                missingInCode.push({ id, name, file: fileName, reason: 'Property "image" is missing in JS' });
            } else {
                const imagePath = imageMatch[1];
                const fileNameOnly = path.basename(imagePath);
                if (!fs.existsSync(path.join(ROOT_DIR, 'public', imagePath))) {
                    missingPhotos.push({ id, name, file: fileName, path: imagePath, reason: 'File not found on disk' });
                }
            }
        }
    }

    console.log('\n--- AUDIT REPORT ---');
    console.log(`Missing "image" property in JS: ${missingInCode.length}`);
    console.log(`File missing on disk: ${missingPhotos.length}`);
    
    if (missingInCode.length > 0) {
        console.log('\n❌ MISSING PROPERTY IN JS:');
        missingInCode.forEach(p => console.log(`- ${p.id} (${p.name}) [in ${p.file}]`));
    }
    
    if (missingPhotos.length > 0) {
        console.log('\n❌ FILE NOT FOUND ON DISK:');
        missingPhotos.forEach(p => console.log(`- ${p.id} (${p.name}) -> ${p.path}`));
    }

    if (missingInCode.length === 0 && missingPhotos.length === 0) {
        console.log('\n✅ ALL GOOD! Every place has an existing image.');
    }
}

auditImages();
