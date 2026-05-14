
import fs from 'fs';
import path from 'path';

const REGIONS_DIR = './src/sections/guide/data/regions';

const cityKeywords = {
    'yalta': ['Ялт', 'Ливади', 'Массандр', 'Гаспр', 'Алупк', 'Кореиз', 'Никит', 'Гурзуф'],
    'sevastopol': ['Севастопол', 'Херсонес', 'Фиолент', 'Инкерман'],
    'balaklava': ['Балаклав', 'Ласпи', 'Чембало'],
    'alushta': ['Алушт', 'Демерджи', 'Хапхал', 'Джур-Джур', 'Изобильн', 'Партенит'],
    'sudak': ['Судак', 'Новый Свет', 'Голицын', 'Меганом', 'Алчак'],
    'evpatoria': ['Евпатори', 'Сасык', 'Мойнаки'],
    'bakhchisarai': ['Бахчисарай', 'Чуфут-Кале', 'Мангуп'],
    'simferopol': ['Симферопол', 'Чокурча'],
    'feodosia': ['Феодоси', 'Коктебель', 'Кара-Даг'],
    'kerch': ['Керчь', 'Митридат', 'Ени-Кале'],
};

const manualCityMap = {
    'chersonesus': 'sevastopol',
    'balaklava-base': 'balaklava',
    'sudak-fortress': 'sudak',
    'golitsyn-trail': 'novyi-svet',
    'dreamwood-park': 'opolznevoe',
    'taigan-safari': 'belogorsk',
    'atlantida-waterpark': 'yalta',
    'swallows-nest': 'gaspra',
    'livadia-palace': 'livadia',
    'vorontsov-palace': 'alupka',
    'ai-petri': 'koreiz',
    'nikitsky-garden': 'nikita',
    'massandra-palace': 'massandra',
    'massandra-winery': 'massandra',
    'massandra-beach': 'yalta',
    'sevastopol-panorama': 'sevastopol',
    'malakhov-kurgan': 'sevastopol',
    'alexander-nevsky-yalta': 'yalta',
    'yalta-aquarium': 'yalta',
    'yalta-crocodilearium': 'yalta',
    'sevastopol-monument-sunken-ships': 'sevastopol',
    'sevastopol-grafskaya-pristan': 'sevastopol',
    'ghost-valley': 'alushta',
    'dzhur-dzhur': 'alushta',
    'alushta-aquarium': 'alushta',
};

function smartFix() {
    const files = fs.readdirSync(REGIONS_DIR).filter(f => f.endsWith('.js'));
    let totalUpdated = 0;

    for (const file of files) {
        const filePath = path.join(REGIONS_DIR, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let updatedInFile = 0;

        // Better regex: match from id until city/category/region block
        const entryRegex = /(['"]?([a-zA-Z0-9_-]+)['"]?\s*:\s*{[\s\S]*?}(?=\s*,?\s*['"]?[a-zA-Z0-9_-]+['"]?\s*:\s*{|\s*};))/g;
        // Or even simpler: split by entries
        const parts = content.split(/(?=\n\s*['"]?[a-zA-Z0-9_-]+['"]?\s*:\s*{)/);
        
        let newContent = parts.map(part => {
            let body = part;
            const idMatch = body.match(/['"]?([a-zA-Z0-9_-]+)['"]?\s*:\s*{/);
            if (!idMatch) return part;
            
            const id = idMatch[1];
            
            // 1. Fix City
            if (body.includes("city: 'all'")) {
                let foundCity = manualCityMap[id];
                if (!foundCity) {
                    for (const [city, keywords] of Object.entries(cityKeywords)) {
                        if (keywords.some(k => body.includes(k))) {
                            foundCity = city;
                            break;
                        }
                    }
                }
                if (foundCity) {
                    body = body.replace(/city:\s*['"]all['"]/, `city: '${foundCity}'`);
                }
            }
            
            // 2. Fix Category
            if (body.includes("category: 'other'")) {
                let cat = 'other';
                if (body.match(/ресторан|кафе|кухня|еда|пицца|вино/i)) cat = 'food';
                else if (body.match(/пляж|берег|купание|бухта/i)) cat = 'beaches';
                else if (body.match(/парк|сад|фонтан|ботанич/i)) cat = 'parks';
                else if (body.match(/музей|дворец|история|крепость|монастырь|храм|собор|памятник/i)) cat = 'history';
                else if (body.match(/гора|скал[аы]|природа|мыс|грот|каньон|пещер/i)) cat = 'nature';
                else if (body.match(/супермаркет|магазин|рынок/i)) cat = 'shopping';
                else if (body.match(/аквапарк|дельфинарий|аттракцион|зоопарк|дети/i)) cat = 'kids';
                
                if (cat !== 'other') {
                    body = body.replace(/category:\s*['"]other['"]/, `category: '${cat}'`);
                }
            }

            if (body !== part) {
                updatedInFile++;
            }
            return body;
        }).join('');

        fs.writeFileSync(filePath, newContent);
        console.log(`✅ ${file}: Updated ${updatedInFile} entries.`);
        totalUpdated += updatedInFile;
    }
    
    console.log(`\n🎉 Total updated entries across all regions: ${totalUpdated}`);
}

smartFix();
