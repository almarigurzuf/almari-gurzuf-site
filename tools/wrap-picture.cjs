const fs = require('fs');
const path = require('path');

const FILES = [
    path.resolve(__dirname, 'src/sections/apartments/apartments.html'),
];

for (const filePath of FILES) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace <img src="/assets/apartments/...jpg" ...> with <picture><source webp><img></picture>
    // Only if not already wrapped in <picture>
    const imgRegex = /(<img\s[^>]*src="(\/assets\/apartments\/[^"]+\.jpg)"[^>]*>)/g;

    let count = 0;
    content = content.replace(imgRegex, (fullMatch, imgTag, src) => {
        // Check it's not already inside a <picture> — look for preceding <source
        // (We'll do a second pass check instead: just wrap all matches)
        const webpSrc = src.replace(/\.jpg$/i, '.webp');
        count++;
        return `<picture><source srcset="${webpSrc}" type="image/webp">${imgTag}</picture>`;
    });

    // Remove double-wrapping if any existed (idempotent re-run safety)
    content = content.replace(/<picture><source srcset="([^"]+)" type="image\/webp"><picture><source srcset="[^"]+" type="image\/webp">(<img[^>]+>)<\/picture><\/picture>/g,
        '<picture><source srcset="$1" type="image/webp">$2</picture>');

    fs.writeFileSync(filePath, content);
    console.log(`${path.basename(filePath)}: wrapped ${count} images`);
}
