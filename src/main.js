import './main.css'; // v1.0.6
import flatpickr from 'flatpickr';
import { Russian } from 'flatpickr/dist/l10n/ru.js';
import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/themes/material_blue.css';

// Set default locale
flatpickr.localize(Russian);

import { initHeader } from './sections/header/header.js';
import { initContactWidget } from './sections/widget/widget.js';
import { initSliders } from './sections/apartments/slider.js';
import { initLightbox } from './sections/lightbox/lightbox.js';
import { initBooking } from './sections/booking/booking.js';
import { initDetails } from './sections/details/details.js';
import { initSecurity } from './sections/common/security.js';
import { initSearchPanel } from './sections/booking/search.js';
import { initVideoModal } from './sections/video-modal/video-modal.js';
import { initCookieNotice } from './sections/cookie/cookie.js';
import { initFaq } from './sections/faq/faq.js';
import { initLocation } from './sections/location/location.js';
import { initGuide } from './sections/guide/guide.js';

document.addEventListener('DOMContentLoaded', () => {
    const initApp = {
        'Header': initHeader,
        'Widget': initContactWidget,
        'Sliders': initSliders,
        'Lightbox': initLightbox,
        'Booking': initBooking,
        'Details': initDetails,
        'Security': initSecurity,
        'Search': initSearchPanel,
        'Video': initVideoModal,
        'Cookie': initCookieNotice,
        'FAQ': initFaq,
        'Location': initLocation,
        'Guide': initGuide
    };

    Object.entries(initApp).forEach(([name, initFn]) => {
        try {
            initFn();
        } catch (e) {
            console.error(`Error initializing ${name}:`, e);
        }
    });
    
    // Back to Top Logic
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Scroll Reveal Logic
    const revealElements = document.querySelectorAll('.reveal, .reveal-stagger, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Optional: stop observing once revealed
                // revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    console.log('Almari Gurzuf project initialized with modular structure!');
});

// --- DYNAMIC WATERMARK DOWNLOAD ---
window.downloadWithWatermark = function(button, imageUrl) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const fontSize = Math.min(canvas.width, canvas.height) / 8;
        ctx.font = `900 ${fontSize}px Montserrat, sans-serif`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-45 * Math.PI / 180);
        ctx.fillText("АЛЬМАРИ", 0, 0);
        
        const link = document.createElement('a');
        link.download = 'Almari_Complex_Protected.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        
        button.innerHTML = originalText;
    };
    
    img.onerror = function() {
        alert('Ошибка обработки фото.');
        button.innerHTML = originalText;
    };
};
