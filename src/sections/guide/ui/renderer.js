import { getShortDesc } from '../utils/helpers.js';

export function renderCards(container, places, filters) {
    if (!container) return;

    const { currentRegion, currentCity, currentCat } = filters;
    container.innerHTML = '';

    if (!currentRegion || !currentCity) return;

    const filtered = Object.entries(places).filter(([, place]) => {
        if (place.region !== currentRegion && place.region !== 'all') return false;
        if (currentCat !== 'all' && place.category !== currentCat) return false;
        if (currentCity !== 'all' && place.city && place.city !== currentCity && place.city !== 'all') return false;
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 3rem; color: #666;">В этой категории пока ничего нет.</div>';
        return;
    }

    const html = filtered.map(([id, place], idx) => {
        const img = place.image ? `<img class="guide-card-img" src="${place.image}" alt="${place.name}" loading="lazy">` : '';
        const rating = place.rating ? `<div class="guide-card-rating"><i class="fas fa-star"></i> ${place.rating}</div>` : '';
        const shortText = getShortDesc(place.desc);
        const desc = shortText ? `<div class="guide-card-desc" style="-webkit-line-clamp: 2;">${shortText}</div>` : '';
        const routeBtn = place.routeDest
            ? `<button class="btn-route-card" data-route-dest="${place.routeDest}"><i class="fas fa-route"></i> Маршрут</button>`
            : '';
        const webBtn = place.website
            ? `<a href="${place.website}" target="_blank" class="btn-route-card btn-web-card"><i class="fas fa-globe"></i> Сайт</a>`
            : '';

        return `
            <div class="guide-card guide-card--has-img appear" style="--idx: ${idx}">
                ${img}
                <div class="guide-card-header">
                    <div class="guide-card-name">${place.name}</div>
                    ${rating}
                </div>
                <div class="guide-card-type">${place.type || place.categoryName || ''}</div>
                ${desc}
                <div class="guide-card-actions">
                    <button class="btn-details" data-guide-id="${id}">Подробнее</button>
                    ${webBtn}
                    ${routeBtn}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}
