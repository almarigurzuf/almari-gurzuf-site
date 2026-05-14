import fs from 'fs';
import { JSDOM } from 'jsdom';

const categories = [
    { url: 'https://region82.su/prirodnye/gory/', id: 'mountains', catName: 'Горы', catIcon: 'fas fa-mountain' },
    { url: 'https://region82.su/prirodnye/vodopady/', id: 'waterfalls', catName: 'Водопады', catIcon: 'fas fa-water' },
    { url: 'https://region82.su/prirodnye/peshhery/', id: 'caves', catName: 'Пещеры', catIcon: 'fas fa-dungeon' },
    { url: 'https://region82.su/prirodnye/kanony/', id: 'canyons', catName: 'Каньоны', catIcon: 'fas fa-map-signs' },
    { url: 'https://region82.su/prirodnye/ozera/', id: 'lakes', catName: 'Озера', catIcon: 'fas fa-tint' },
    { url: 'https://region82.su/prirodnye/zapovedniki/', id: 'parks', catName: 'Заповедники', catIcon: 'fas fa-tree' }
];

const cityMap = {
    'Алупка': 'alupka',
    'Алушта': 'alushta',
    'Балаклава': 'balaklava',
    'Бахчисарай': 'bakhchisarai',
    'Гурзуф': 'gurzuf',
    'Евпатория': 'evpatoria',
    'Керчь': 'kerch',
    'Кореиз': 'koreiz',
    'Ливадия': 'livadia',
    'Массандра': 'massandra',
    'Новый Свет': 'noviy_svet',
    'Оленевка': 'olenevka',
    'Севастополь': 'sevastopol',
    'Симферополь': 'simferopol',
    'Судак': 'sudak',
    'Феодосия': 'feodosiya',
    'Ялта': 'yalta',
    'Белогорск': 'belogorsk',
    'Симеиз': 'yalta'
};

const regionMap = {
    'alupka': 'south',
    'alushta': 'south',
    'gurzuf': 'south',
    'koreiz': 'south',
    'livadia': 'south',
    'massandra': 'south',
    'yalta': 'south',
    'balaklava': 'west',
    'evpatoria': 'west',
    'olenevka': 'west',
    'sevastopol': 'west',
    'kerch': 'east',
    'noviy_svet': 'east',
    'sudak': 'east',
    'feodosiya': 'east',
    'bakhchisarai': 'north',
    'simferopol': 'north',
    'belogorsk': 'north'
};

function getCityId(ruCity) {
    if (!ruCity) return 'yalta'; // fallback
    for (const [k, v] of Object.entries(cityMap)) {
        if (ruCity.includes(k)) return v;
    }
    return 'yalta'; // fallback
}

async function scrape() {
    const results = {};
    for (const cat of categories) {
        console.log(`Scraping ${cat.url}`);
        const res = await fetch(cat.url);
        const html = await res.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        const cards = document.querySelectorAll('ul.sights > li');
        console.log(`Found ${cards.length} cards in ${cat.id}`);
        
        cards.forEach((card, idx) => {
            const titleEl = card.querySelector('.main a');
            if (!titleEl) return;
            const title = titleEl.textContent.trim();
            
            const ratingEl = card.querySelector('.rating');
            const rating = ratingEl ? ratingEl.textContent.trim() : '4.5';
            
            const descEl = card.querySelector('.main p');
            const desc = descEl ? descEl.textContent.trim() : '';
            
            const locEl = card.querySelector('.tags a');
            const ruCity = locEl ? locEl.textContent.trim() : '';
            
            const cityId = getCityId(ruCity);
            const regionId = regionMap[cityId] || 'south';
            
            // Generate a safe id based on category and index
            const key = `${cat.id}-place-${idx}`;
            
            results[key] = {
                name: title,
                rating: rating,
                type: cat.catName,
                desc: desc || 'Удивительное место в Крыму, обязательное к посещению.',
                facts: [
                    { icon: cat.catIcon, label: 'Категория', value: cat.catName }
                ],
                region: regionId,
                city: cityId,
                category: cat.id
            };
        });
    }
    
    fs.writeFileSync('src/sections/guide/scraped_places.js', `export const SCRAPED_PLACES = ${JSON.stringify(results, null, 4)};\n`);
    console.log('Done writing scraped_places.js');
}

scrape().catch(console.error);
