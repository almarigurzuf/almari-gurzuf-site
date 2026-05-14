export function initSliders() {
    const cards = document.querySelectorAll('.apt-card');

    cards.forEach((card, cardIndex) => {
        const container = card.querySelector('.slider-container');
        const images = container.querySelectorAll('img');
        const nextBtn = card.querySelector('.slider-btn.next');
        const prevBtn = card.querySelector('.slider-btn.prev');
        const dotsContainer = card.querySelector('.slider-dots');
        
        let currentIndex = 0;

        // Lazy loading for slider images
        const loadImage = (index) => {
            if (index < 0 || index >= images.length) return;
            const img = images[index];
            if (img.dataset.src) {
                img.src = img.dataset.src;
                delete img.dataset.src;
                img.classList.remove('lazy-slider');
            }
        };

        // Preload next image for smoother experience
        const preloadNext = (index) => {
            loadImage(index + 1);
            loadImage(index - 1);
        };

        // Create dots
        images.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.dot');

        function updateSlider() {
            loadImage(currentIndex);
            preloadNext(currentIndex);
            container.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }

        function goToSlide(index) {
            currentIndex = index;
            updateSlider();
        }

        // Touch support
        let touchStartX = 0;
        let touchEndX = 0;

        card.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        card.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe Left -> Next
                currentIndex = (currentIndex + 1) % images.length;
                updateSlider();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe Right -> Prev
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                updateSlider();
            }
        }

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentIndex = (currentIndex + 1) % images.length;
            updateSlider();
        });

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateSlider();
        });

        // Initialize first slide and preload next
        loadImage(0);
        loadImage(1);
    });
}
