export function initVideoModal() {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('apartment-video');
    const closeBtn = document.querySelector('.video-modal-close');
    const videoBtns = document.querySelectorAll('.btn-video');

    if (!modal || !video || !closeBtn) return;

    videoBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const videoSrc = btn.getAttribute('data-video-src');
            if (videoSrc) {
                video.src = videoSrc;
                video.muted = true;
                modal.classList.add('active');
                video.play();
            }
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
        video.pause();
        video.src = '';
    };

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}
