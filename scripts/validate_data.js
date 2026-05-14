import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/sections/guide/data/regions');
const FILES = ['south.js', 'north.js', 'east.js', 'west.js'];

let hasErrors = false;

FILES.forEach(file => {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/export const \w+ = (\{[\s\S]*?\});$/m);
    
    if (match) {
        try {
            const places = new Function(`return ${match[1]}`)();
            
            Object.entries(places).forEach(([id, place]) => {
                const errors = [];
                
                // Schema rules
                if (!place.name) errors.push('Missing "name"');
                if (!place.desc) errors.push('Missing "desc"');
                if (!place.category) errors.push('Missing "category"');
                if (!place.city) errors.push('Missing "city"');
                if (!place.region) errors.push('Missing "region"');
                if (!place.image) errors.push('Missing "image"');
                
                // Optional but highly recommended
                if (!place.routeDest && !place.distance) {
                    console.warn(`[WARN] ${id} in ${file}: Missing both routeDest and distance`);
                }
                
                if (errors.length > 0) {
                    hasErrors = true;
                    console.error(`[ERROR] ${id} in ${file}:`);
                    errors.forEach(e => console.error(`  - ${e}`));
                }
            });
            
        } catch (e) {
            console.error(`[FATAL] Could not parse ${file}: ${e.message}`);
            hasErrors = true;
        }
    }
});

if (hasErrors) {
    console.error('\n❌ Validation failed. Please fix the data schema errors above.');
    process.exit(1);
} else {
    console.log('\n✅ Data validation passed! All cards have required fields.');
}
