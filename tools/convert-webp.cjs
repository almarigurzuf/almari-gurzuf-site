const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const DIRS = [
    path.resolve(__dirname, 'public/assets/apartments'),
    path.resolve(__dirname, 'public/assets'),
];

const QUALITY = 82;

async function convertDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await convertDir(fullPath);
        } else if (/\.(jpg|jpeg)$/i.test(entry.name)) {
            const webpPath = fullPath.replace(/\.(jpg|jpeg)$/i, '.webp');
            if (fs.existsSync(webpPath)) {
                console.log(`  skip (exists): ${webpPath}`);
                continue;
            }
            try {
                const info = await sharp(fullPath)
                    .webp({ quality: QUALITY })
                    .toFile(webpPath);
                const origSize = fs.statSync(fullPath).size;
                const savings = Math.round((1 - info.size / origSize) * 100);
                console.log(`  ${entry.name} → ${path.basename(webpPath)}  ${Math.round(origSize/1024)}KB → ${Math.round(info.size/1024)}KB  (-${savings}%)`);
            } catch (e) {
                console.error(`  ERROR ${fullPath}: ${e.message}`);
            }
        }
    }
}

(async () => {
    for (const dir of DIRS) {
        console.log(`\nProcessing: ${dir}`);
        await convertDir(dir);
    }
    console.log('\nDone.');
})();
