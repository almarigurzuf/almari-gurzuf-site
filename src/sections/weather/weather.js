export async function initWeather() {
    const weatherContainer = document.getElementById('weather-widget');
    if (!weatherContainer) return;

    // Координаты Гурзуфа
    const lat = 44.54;
    const lon = 34.28;

    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();

        if (data && data.current_weather) {
            const temp = Math.round(data.current_weather.temperature);
            const code = data.current_weather.weathercode;
            
            // Маппинг иконок FontAwesome к кодам погоды WMO
            let icon = 'fa-sun';
            if (code >= 1 && code <= 3) icon = 'fa-cloud-sun';
            if (code >= 45 && code <= 48) icon = 'fa-smog';
            if (code >= 51 && code <= 67) icon = 'fa-cloud-showers-heavy';
            if (code >= 71 && code <= 77) icon = 'fa-snowflake';
            if (code >= 80 && code <= 82) icon = 'fa-cloud-rain';
            if (code >= 95) icon = 'fa-bolt';

            weatherContainer.innerHTML = `
                <i class="fas ${icon}"></i>
                <span>Гурзуф <span class="weather-temp">${temp > 0 ? '+' : ''}${temp}°C</span></span>
            `;
        }
    } catch (error) {
        console.error('Ошибка загрузки погоды:', error);
        // В случае ошибки просто не показываем виджет
        weatherContainer.style.display = 'none';
    }
}
