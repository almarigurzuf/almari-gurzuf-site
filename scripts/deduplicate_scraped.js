
import fs from 'fs';
import path from 'path';

const MANUAL_DIR = './src/sections/guide/data/regions';
const SCRAPED_FILE = './src/sections/guide/data/scraped_places.js';

function deduplicate() {
    console.log('🧹 Deduplicating scraped places...');
    
    // 1. Collect all manual names
    const manualNames = new Set();
    const files = fs.readdirSync(MANUAL_DIR).filter(f => f.endsWith('.js'));
    for (const file of files) {
        const content = fs.readFileSync(path.join(MANUAL_DIR, file), 'utf8');
        const nameMatches = content.match(/name:\s*['"]([^'"]+)['"]/g);
        if (nameMatches) {
            nameMatches.forEach(m => {
                const name = m.match(/['"]([^'"]+)['"]/)[1];
                manualNames.add(name.toLowerCase().trim());
            });
        }
    }
    console.log(`📚 Found ${manualNames.size} unique manual place names.`);

    // 2. Filter scraped places
    const scrapedContent = fs.readFileSync(SCRAPED_FILE, 'utf8');
    const parts = scrapedContent.split(/(?=\n\s*['"]?[a-zA-Z0-9_-]+['"]?\s*:\s*{)/);
    
    let removedCount = 0;
    const newParts = parts.filter(part => {
        const nameMatch = part.match(/["']name["']\s*:\s*["']([^"']+)["']/);
        if (!nameMatch) return true;
        
        const name = nameMatch[1].toLowerCase().trim();
        if (manualNames.has(name)) {
            removedCount++;
            return false;
        }
        return true;
    });

    fs.writeFileSync(SCRAPED_FILE, newParts.join(''));
    console.log(`✅ Removed ${removedCount} duplicates from scraped_places.js.`);
}

deduplicate();
