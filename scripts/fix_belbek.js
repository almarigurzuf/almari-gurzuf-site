
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const INPUT_IMAGE = '/Users/vladkozjaevgmail.com/.gemini/antigravity/brain/45da295d-6515-4e49-9f87-d1f558bf2f94/belbek_canyon_crimea_1778765793604.png';
const OUTPUT_PATH = '/Users/vladkozjaevgmail.com/Desktop/AI/Project/site/public/assets/guide/canyons-place-2.webp';

async function processOne() {
    await sharp(INPUT_IMAGE)
        .resize(800, 500, { fit: 'cover', position: 'center' })
        .webp({ quality: 80 })
        .toFile(OUTPUT_PATH);
    
    console.log('✅ Belbek Canyon image processed.');
}

processOne().catch(err => console.error(err));
