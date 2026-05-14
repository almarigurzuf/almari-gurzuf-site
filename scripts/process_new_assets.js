
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ASSETS_DIR = '/Users/vladkozjaevgmail.com/Desktop/AI/Project/site/public/assets/guide';
const CRIME_DIR = path.join(ASSETS_DIR, 'crimea');

const IMAGES = [
    { src: '/Users/vladkozjaevgmail.com/.gemini/antigravity/brain/45da295d-6515-4e49-9f87-d1f558bf2f94/crimea_hero_bg_clean_1778765944703.png', dest: path.join(CRIME_DIR, 'crimea_hero_bg.webp'), w: 1920, h: 1080 },
    { src: '/Users/vladkozjaevgmail.com/.gemini/antigravity/brain/45da295d-6515-4e49-9f87-d1f558bf2f94/kadykovsky_quarry_heart_1778765970509.png', dest: path.join(ASSETS_DIR, 'kadykovsky-quarry.webp'), w: 800, h: 500 },
    { src: '/Users/vladkozjaevgmail.com/.gemini/antigravity/brain/45da295d-6515-4e49-9f87-d1f558bf2f94/crimean_bridge_sunset_1778765999494.png', dest: path.join(ASSETS_DIR, 'crimean-bridge.webp'), w: 800, h: 500 },
    { src: '/Users/vladkozjaevgmail.com/.gemini/antigravity/brain/45da295d-6515-4e49-9f87-d1f558bf2f94/kalamita_fortress_inkerman_1778766022632.png', dest: path.join(ASSETS_DIR, 'kalamita-fortress.webp'), w: 800, h: 500 },
    { src: '/Users/vladkozjaevgmail.com/.gemini/antigravity/brain/45da295d-6515-4e49-9f87-d1f558bf2f94/izobilnoe_reservoir_crimea_1778766045166.png', dest: path.join(ASSETS_DIR, 'izobilnoe-reservoir.webp'), w: 800, h: 500 },
    { src: '/Users/vladkozjaevgmail.com/.gemini/antigravity/brain/45da295d-6515-4e49-9f87-d1f558bf2f94/chertov_palets_koktebel_1778766070685.png', dest: path.join(ASSETS_DIR, 'chertov-palets-koktebel.webp'), w: 800, h: 500 },
];

async function processAll() {
    if (!fs.existsSync(CRIME_DIR)) fs.mkdirSync(CRIME_DIR, { recursive: true });

    for (const img of IMAGES) {
        await sharp(img.src)
            .resize(img.w, img.h, { fit: 'cover', position: 'center' })
            .webp({ quality: 85 })
            .toFile(img.dest);
        console.log(`✅ Processed: ${path.basename(img.dest)}`);
    }
}

processAll().catch(err => console.error(err));
