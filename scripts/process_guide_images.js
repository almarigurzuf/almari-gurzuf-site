
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const ROOT_DIR = process.cwd();
const GUIDE_ASSETS_DIR = path.join(ROOT_DIR, 'public/assets/guide');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public/assets/guide'); 

async function processImages() {
    console.log('🚀 Starting image processing...');
    
    const items = fs.readdirSync(GUIDE_ASSETS_DIR);
    const dirs = items.filter(item => fs.statSync(path.join(GUIDE_ASSETS_DIR, item)).isDirectory());
    
    let processedCount = 0;
    const mapping = {};

    for (const dirName of dirs) {
        // Extract ID (first part before " - ")
        const id = dirName.split(' - ')[0].trim();
        const dirPath = path.join(GUIDE_ASSETS_DIR, dirName);
        
        const files = fs.readdirSync(dirPath);
        const imageFile = files.find(f => f.match(/\.(jpg|jpeg|png|webp|avif)$/i));
        
        if (imageFile) {
            const inputPath = path.join(dirPath, imageFile);
            const outputPath = path.join(OUTPUT_DIR, `${id}.webp`);
            
            try {
                await sharp(inputPath)
                    .resize(800, 500, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .webp({ quality: 80 })
                    .toFile(outputPath);
                
                processedCount++;
                mapping[id] = `/assets/guide/${id}.webp`;
                process.stdout.write(`.`);
            } catch (err) {
                console.error(`\n❌ Error processing ${dirName}:`, err.message);
            }
        }
    }

    console.log(`\n✅ Processed ${processedCount} images.`);
    return mapping;
}

async function updateDataFiles(mapping) {
    const dataDir = path.join(ROOT_DIR, 'src/sections/guide/data');
    const files = ['manual_places.js', 'scraped_places.js', 'parsed_places.js'];

    for (const fileName of files) {
        const filePath = path.join(dataDir, fileName);
        if (!fs.existsSync(filePath)) continue;

        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        // Pattern 1: Update existing image properties
        // Pattern 2: Add image property if it matches an ID in our mapping
        
        // This is tricky with regex, let's parse and stringify if possible, 
        // but since they are exported objects, we can try to inject it.
        
        // Simpler approach: find "ID": { ... } and add/replace image
        for (const [id, path] of Object.entries(mapping)) {
            const idPattern = new RegExp(`(['"]${id}['"]:\\s*{)`, 'g');
            if (content.match(idPattern)) {
                // If image already exists, replace it
                const imageExistsPattern = new RegExp(`(['"]${id}['"]:\\s*{[\\s\\S]*?image:\\s*['"]).*?(['"])`, 'g');
                if (content.match(imageExistsPattern)) {
                    content = content.replace(imageExistsPattern, `$1${path}$2`);
                } else {
                    // Inject image property
                    content = content.replace(idPattern, `$1\n        image: '${path}',`);
                }
                updated = true;
            }
        }

        if (updated) {
            fs.writeFileSync(filePath, content);
            console.log(`📄 Updated ${fileName}`);
        }
    }
}

async function main() {
    const mapping = await processImages();
    await updateDataFiles(mapping);
    console.log('🎉 Done! All images processed and data updated.');
}

main().catch(err => console.error(err));
