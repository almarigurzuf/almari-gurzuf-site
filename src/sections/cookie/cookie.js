export function initCookieNotice() {
    const notice = document.getElementById('cookieNotice');
    
    // Проверяем, принимал ли пользователь куки ранее
    const isAccepted = localStorage.getItem('cookiesAccepted');
    
    if (!isAccepted) {
        // Показываем с небольшой задержкой для эффекта
        setTimeout(() => {
            if (notice) notice.classList.add('show');
        }, 2000);
    }

    window.acceptCookies = () => {
        localStorage.setItem('cookiesAccepted', 'true');
        if (notice) {
            notice.classList.remove('show');
            // Удаляем из DOM после анимации скрытия
            setTimeout(() => {
                notice.remove();
            }, 6000);
        }
    };
}
