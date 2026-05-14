export function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const nextBtn = lightbox.querySelector('.next');
    const prevBtn = lightbox.querySelector('.prev');

    if (!lightboxImg || !closeBtn || !nextBtn || !prevBtn) return;
    
    let currentImages = [];
    let currentIndex = 0;

    // Attach click events to all slider images automatically
    document.querySelectorAll('.slider-container img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (e) => {
            window.openLightbox(e.target);
        });
    });

    // Global function to open lightbox
    window.openLightbox = function(element) {
        // 1. Find all images in the same context (gallery or slider)
        const container = element.closest('.about-gallery') || element.closest('.slider-container') || element.closest('.about-grid');
        if (!container) {
            // Fallback: just open this single image
            const img = element.querySelector('img') || element;
            currentImages = [img.src];
            currentIndex = 0;
        } else {
            // Get all images in this container
            const imgs = Array.from(container.querySelectorAll('img'));
            currentImages = imgs.map(img => img.src);
            const targetImg = element.querySelector('img') || element;
            currentIndex = currentImages.indexOf(targetImg.src);
        }

        if (currentImages.length > 0) {
            updateLightboxImage();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show/hide navigation arrows
            const nav = lightbox.querySelectorAll('.prev, .next');
            nav.forEach(btn => btn.style.display = currentImages.length > 1 ? 'block' : 'none');
        }
    };

    function updateLightboxImage() {
        if (currentImages[currentIndex]) {
            lightboxImg.src = currentImages[currentIndex];
        }
    }

    closeBtn.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % currentImages.length;
        updateLightboxImage();
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        updateLightboxImage();
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}
