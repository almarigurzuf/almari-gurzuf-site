export function initFaq() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Закрываем все остальные айтемы (опционально, но так аккуратнее)
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Если кликнутый айтем не был активен — открываем его
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}
