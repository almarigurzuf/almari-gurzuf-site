/**
 * Truncates HTML description to a short plain text snippet.
 */
export function getShortDesc(htmlDesc) {
    if (!htmlDesc) return '';
    let text = htmlDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const firstDot = text.indexOf('.');
    if (firstDot > 20 && firstDot < 120) {
        text = text.substring(0, firstDot + 1);
    } else if (text.length > 120) {
        text = text.substring(0, 117) + '...';
    }
    return text;
}

/**
 * Returns pricing and service information for 2026 based on category and type.
 */
export function get2026Info(category, type) {
    const cat = category || '';
    const t = (type || '').toLowerCase();
    let info = '';

    if (cat === 'history' || t.includes('дворец') || t.includes('замок') || t.includes('музей')) {
        info = '<b>Цены 2026:</b> Взрослый билет — 600-800 руб., детский и льготный — 300-400 руб. Экскурсионное обслуживание от 200 руб.';
    } else if (cat === 'waterfalls' || cat === 'nature' || cat === 'canyons' || cat === 'lakes' || cat === 'mountains' || t.includes('водопад') || t.includes('гор')) {
        info = '<b>Цены 2026:</b> Экологический сбор — 350 руб. (Бесплатно для жителей Крыма при наличии регистрации). Детям до 7 лет бесплатно. Обязательна удобная обувь.';
    } else if (cat === 'caves' || t.includes('пещер')) {
        info = '<b>Цены 2026:</b> Входной билет — от 800 руб. Температура внутри +9°C круглый год, доступна аренда курток (от 100 руб.).';
    } else if (cat === 'kids' || cat === 'entertainment' || t.includes('аквапарк') || t.includes('зоопарк')) {
        info = '<b>Цены 2026:</b> Билеты полного дня: Взрослый — 2000-2500 руб., Детский — 1500 руб. Доступны семейные тарифы.';
    } else if (cat === 'parks' || t.includes('парк') || t.includes('заповедник')) {
        info = '<b>Цены 2026:</b> Вход — 300-500 руб. Экскурсии на электромобилях — от 1000 руб.';
    } else if (cat === 'shops' || t.includes('маркет') || t.includes('магазин')) {
        info = '<b>Информация 2026:</b> Уровень цен локальный. В разгар курортного сезона возможны очереди в вечернее время. Можно расплачиваться картами МИР.';
    } else if (cat === 'food' || t.includes('кафе') || t.includes('ресторан')) {
        info = '<b>Цены 2026:</b> Средний чек: 1000-2500 руб. В летний сезон рекомендуем бронировать столики заранее.';
    } else if (cat === 'taxi' || t.includes('такси')) {
        info = '<b>Информация 2026:</b> Рекомендуем использовать официальные приложения для фиксации цены. Средняя стоимость подачи — 150-200 руб., далее по тарифу.';
    }

    return info ? `<div class="guide-detail-2026-info">${info}</div>` : '';
}

export function openRouteWithGeolocation(dest) {
    if (!dest) return;
    const fallback = () => window.open(`https://yandex.ru/maps/?rtext=~${dest}&rtt=auto`, '_blank');
    if (!navigator.geolocation) { fallback(); return; }
    navigator.geolocation.getCurrentPosition(
        pos => {
            const { latitude: lat, longitude: lon } = pos.coords;
            window.open(`https://yandex.ru/maps/?rtext=${lat},${lon}~${dest}&rtt=auto`, '_blank');
        },
        fallback,
        { timeout: 6000 }
    );
}
