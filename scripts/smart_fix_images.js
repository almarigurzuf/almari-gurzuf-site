
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'src/sections/guide/data');
const ASSETS_DIR = path.join(ROOT_DIR, 'public/assets/guide');

async function fixMissingImages() {
    console.log('🔍 Starting smart data update...');
    
    // Get all webp files in assets
    const photos = fs.readdirSync(ASSETS_DIR).filter(f => f.endsWith('.webp'));
    const mapping = {};
    photos.forEach(f => {
        const id = f.replace('.webp', '');
        mapping[id] = `/assets/guide/${f}`;
    });

    const dataFiles = ['manual_places.js', 'scraped_places.js', 'parsed_places.js'];

    for (const fileName of dataFiles) {
        const filePath = path.join(DATA_DIR, fileName);
        if (!fs.existsSync(filePath)) continue;

        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        for (const [id, imagePath] of Object.entries(mapping)) {
            // Flexible regex: matches id with or without quotes, followed by colon and brace
            // Matches: id: {, 'id': {, "id": {
            const idPattern = new RegExp(`(['"]?${id}['"]?\\s*:\\s*{)`, 'g');
            
            if (content.match(idPattern)) {
                // Check if image property already exists
                const imagePropPattern = new RegExp(`(['"]?${id}['"]?\\s*:\\s*{[\\s\\S]*?image:\\s*['"])(.*?)(['"])`);
                
                if (content.match(imagePropPattern)) {
                    // Update existing
                    content = content.replace(imagePropPattern, `$1${imagePath}$3`);
                } else {
                    // Inject new image property after the opening brace
                    content = content.replace(idPattern, `$1\n        image: '${imagePath}',`);
                }
                updated = true;
            }
        }

        if (updated) {
            fs.writeFileSync(filePath, content);
            console.log(`✅ Fixed missing/incorrect images in ${fileName}`);
        }
    }

    console.log('🎉 Smart update finished!');
}

fixMissingImages().catch(err => console.error(err));
