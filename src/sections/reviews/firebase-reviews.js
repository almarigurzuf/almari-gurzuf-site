const API_BASE = '/api';
const AVATAR_COLORS = ['#0093E9', '#80D0C7', '#1a2a3a', '#946B09', '#38a169'];
const STAR_LABELS   = ['', 'Плохо', 'Нормально', 'Хорошо', 'Отлично', 'Превосходно!'];

export function initFirebaseReviews() {
    loadApprovedReviews();
    initReviewForm();
}

// ---- Загрузка одобренных отзывов ----
async function loadApprovedReviews() {
    const grid = document.getElementById('firebase-reviews-grid');
    if (!grid) return;

    try {
        const res  = await fetch(`${API_BASE}/reviews.php`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.reviews?.length) return;

        const section = document.getElementById('firebase-reviews-section');
        if (section) section.style.display = 'block';

        data.reviews.forEach(rv => grid.appendChild(buildCard(rv)));
        injectSchemaMarkup(data.reviews);
    } catch (err) {
        console.error('[Reviews] Ошибка:', err);
    }
}

function injectSchemaMarkup(reviews) {
    if (!reviews.length) return;

    const avg = (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1);

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'LodgingBusiness',
        name: 'Альмари Гурзуф',
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avg,
            reviewCount: reviews.length,
            bestRating: '5',
            worstRating: '1',
        },
        review: reviews.map(rv => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: rv.name },
            reviewRating: { '@type': 'Rating', ratingValue: String(rv.rating || 5) },
            reviewBody: rv.text,
            datePublished: rv.approved_at
                ? new Date(rv.approved_at).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
        })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}

function buildCard(rv) {
    const initial = (rv.name || '?').charAt(0).toUpperCase();
    const color   = AVATAR_COLORS[initial.charCodeAt(0) % AVATAR_COLORS.length];
    const stars   = '★'.repeat(rv.rating || 5) + '☆'.repeat(5 - (rv.rating || 5));
    const date    = rv.approved_at
        ? new Date(rv.approved_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
        : '';

    const photosHtml = rv.photos?.length
        ? `<div class="fbr-photos">${rv.photos.map(url =>
            `<img src="${url}" class="fbr-photo" alt="Фото к отзыву" loading="lazy">`
          ).join('')}</div>`
        : '';

    const el = document.createElement('div');
    el.className = 'fbr-card';
    el.innerHTML = `
        <i class="fas fa-quote-left fbr-quote"></i>
        <div class="fbr-stars">${stars}</div>
        ${photosHtml}
        <p class="fbr-text">«${escHtml(rv.text)}»</p>
        <div class="fbr-author">
            <div class="fbr-avatar" style="background:${color}">${initial}</div>
            <div>
                <div class="fbr-name">${escHtml(rv.name)}</div>
                <div class="fbr-date">${rv.nights ? escHtml(rv.nights) + ' • ' : ''}${date}</div>
            </div>
        </div>
    `;

    el.querySelectorAll('.fbr-photo').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => window.open(img.src, '_blank'));
    });

    return el;
}

// ---- Форма ----
function initReviewForm() {
    const openBtn = document.getElementById('open-review-form-btn');
    const modal   = document.getElementById('reviewFormModal');
    if (!openBtn || !modal) return;

    const closeBtn     = document.getElementById('reviewFormClose');
    const backdrop     = document.getElementById('reviewFormBackdrop');
    const form         = document.getElementById('reviewForm');
    const successClose = document.getElementById('reviewFormSuccessClose');

    openBtn.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);
    successClose?.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    function openModal()  { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Убираем #review из URL не трогая путь
        if (window.location.hash === '#review') {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }

    // Открыть сразу если в URL есть #review — и сразу убрать хэш чтобы при обновлении не повторялось
    if (window.location.hash === '#review') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        setTimeout(openModal, 600);
    }

    // Звёзды
    const stars = [...document.querySelectorAll('.rfm-star')];
    const hint  = document.getElementById('rfm-stars-hint');
    let selectedRating = 0;

    function paintStars(n) {
        stars.forEach((s, i) => s.classList.toggle('active', i < n));
        if (hint) hint.textContent = n ? STAR_LABELS[n] : 'Выберите оценку';
    }
    stars.forEach(s => {
        const v = parseInt(s.dataset.value);
        s.addEventListener('click',      () => { selectedRating = v; paintStars(v); });
        s.addEventListener('mouseenter', () => paintStars(v));
        s.addEventListener('mouseleave', () => paintStars(selectedRating));
    });

    // Фильтр имени — только буквы и пробелы
    const nameInput = document.getElementById('review-name');
    nameInput?.addEventListener('input', () => {
        const pos = nameInput.selectionStart;
        const cleaned = nameInput.value.replace(/[^а-яёА-ЯЁa-zA-Z\s\-]/g, '');
        if (cleaned !== nameInput.value) {
            nameInput.value = cleaned;
            nameInput.setSelectionRange(pos - 1, pos - 1);
        }
    });

    // Фильтр ночей — только цифры
    const nightsInput = document.getElementById('review-nights');
    nightsInput?.addEventListener('input', () => {
        nightsInput.value = nightsInput.value.replace(/[^0-9]/g, '');
    });

    // Счётчик символов
    const textarea  = document.getElementById('review-text');
    const charCount = document.getElementById('review-text-count');
    textarea?.addEventListener('input', () => {
        if (charCount) charCount.textContent = textarea.value.length;
    });

    // Загрузка фото
    const photoInput = document.getElementById('review-photos-input');
    const dropZone   = document.getElementById('review-drop-zone');
    const photoPrev  = document.getElementById('review-photos-preview');
    let selectedFiles = [];

    dropZone?.addEventListener('click', () => photoInput?.click());
    dropZone?.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone?.addEventListener('drop', e => {
        e.preventDefault(); dropZone.classList.remove('drag-over');
        addFiles(Array.from(e.dataTransfer.files));
    });
    photoInput?.addEventListener('change', () => {
        addFiles(Array.from(photoInput.files));
        photoInput.value = '';
    });

    function addFiles(files) {
        const imgs = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
        selectedFiles = [...selectedFiles, ...imgs].slice(0, 3);
        renderPreviews();
    }

    function renderPreviews() {
        if (!photoPrev) return;
        photoPrev.innerHTML = '';
        selectedFiles.forEach((file, idx) => {
            const reader = new FileReader();
            reader.onload = ({ target }) => {
                const wrap = document.createElement('div');
                wrap.className = 'rfm-photo-item';
                wrap.innerHTML = `
                    <img src="${target.result}" alt="Предпросмотр">
                    <button type="button" class="rfm-photo-remove" aria-label="Удалить">&times;</button>
                `;
                wrap.querySelector('.rfm-photo-remove').addEventListener('click', () => {
                    selectedFiles.splice(idx, 1);
                    renderPreviews();
                });
                photoPrev.appendChild(wrap);
            };
            reader.readAsDataURL(file);
        });
        if (dropZone) dropZone.style.display = selectedFiles.length >= 3 ? 'none' : 'flex';
    }

    // Отправка
    const errorEl  = document.getElementById('review-form-error');
    const submitBtn = document.getElementById('reviewSubmitBtn');

    function showError(msg) { if (errorEl) errorEl.textContent = msg; }

    form?.addEventListener('submit', async e => {
        e.preventDefault();
        showError('');

        const name   = form.querySelector('#review-name').value.trim();
        const nights = form.querySelector('#review-nights').value.trim();
        const text   = form.querySelector('#review-text').value.trim();

        if (!name)                { showError('Введите ваше имя.'); return; }
        if (!/^[а-яёА-ЯЁa-zA-Z\s\-]+$/.test(name)) { showError('Имя должно содержать только буквы.'); return; }
        if (!nights || isNaN(nights) || +nights < 1) { showError('Укажите количество ночей.'); return; }
        if (selectedRating === 0) { showError('Пожалуйста, выберите оценку.'); return; }
        if (!text)                { showError('Напишите ваш отзыв.'); return; }
        // Honeypot — бот заполнил скрытое поле
        if (document.getElementById('review-honeypot')?.value) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем…';

        try {
            const fd = new FormData();
            fd.append('name',   name);
            fd.append('nights', nights + ' ' + (nights === '1' ? 'ночь' : +nights < 5 ? 'ночи' : 'ночей'));
            fd.append('rating', selectedRating);
            fd.append('text',   text);
            selectedFiles.forEach(f => fd.append('photos[]', f));

            const res  = await fetch(`${API_BASE}/submit.php`, { method: 'POST', body: fd });
            const data = await res.json();

            if (!res.ok || data.error) {
                showError(data.error || 'Ошибка сервера. Попробуйте позже.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить отзыв';
                return;
            }

            document.getElementById('review-form-body')?.classList.add('rfm-hidden');
            document.getElementById('review-form-success')?.classList.remove('rfm-hidden');

        } catch (err) {
            console.error('[ReviewForm]', err);
            showError('Ошибка соединения. Попробуйте позже.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить отзыв';
        }
    });
}

function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}
