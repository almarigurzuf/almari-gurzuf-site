export function initLocation() {
    const mainMap = document.getElementById('main-map');
    const locationSection = document.getElementById('location');

    if (!mainMap) return;

    // Ленивая загрузка карты через IntersectionObserver
    const mapObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const dataSrc = mainMap.getAttribute('data-src');
                if (dataSrc && !mainMap.src) {
                    setTimeout(() => {
                        mainMap.src = dataSrc;
                    }, 500);
                }
                mapObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    if (locationSection) {
        mapObserver.observe(locationSection);
    }
}
