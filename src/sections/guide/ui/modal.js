import { get2026Info } from '../utils/helpers.js';

export function setupModal(allPlaces) {
    const overlay = document.getElementById('guide-detail-modal');
    if (!overlay) return;

    const heroImg   = overlay.querySelector('.guide-detail-hero-img');
    const ratingEl  = overlay.querySelector('.gd-rating');
    const titleEl   = overlay.querySelector('.guide-detail-title');
    const typeEl    = overlay.querySelector('.gd-type');
    const distEl    = overlay.querySelector('.gd-distance-val');
    const descEl    = overlay.querySelector('.guide-detail-desc');
    const factsEl   = overlay.querySelector('.guide-detail-facts');
    const tipEl     = overlay.querySelector('.guide-detail-tip');
    const actionsEl = overlay.querySelector('.guide-detail-actions');
    const closeBtn  = overlay.querySelector('.guide-detail-close');

    function openDetailModal(id) {
        const p = allPlaces[id];
        if (!p) return;

        if (heroImg) {
            heroImg.src = p.image || '';
            heroImg.style.display = p.image ? 'block' : 'none';
        }
        if (ratingEl) ratingEl.textContent = p.rating || '';
        if (titleEl) titleEl.textContent  = p.name || '';
        if (typeEl) typeEl.textContent   = p.type || p.categoryName || '';
        if (distEl) {
            distEl.textContent = p.distance || '';
            const distParent = distEl.closest('.gd-distance');
            if (distParent) {
                distParent.style.display = p.distance ? 'flex' : 'none';
            }
        }

        
        const extraInfo = get2026Info(p.category, p.type);
        if (descEl) descEl.innerHTML = (p.desc || 'Описание отсутствует.') + extraInfo;

        if (factsEl) {
            if (p.facts && Array.isArray(p.facts)) {
                factsEl.innerHTML = p.facts.map(f => `
                    <div class="gd-fact">
                        <div class="gd-fact-icon"><i class="${f.icon}"></i></div>
                        <div class="gd-fact-text">
                            <span class="gd-fact-label">${f.label}</span>
                            <span class="gd-fact-value">${f.value}</span>
                        </div>
                    </div>`).join('');
                factsEl.style.display = 'grid';
            } else {
                factsEl.innerHTML = '';
                factsEl.style.display = 'none';
            }
        }

        if (tipEl) {
            if (p.tip) {
                tipEl.innerHTML = `<strong>Совет:</strong> ${p.tip}`;
                tipEl.classList.add('visible');
            } else {
                tipEl.classList.remove('visible');
            }
        }

        if (actionsEl) {
            let buttonsHtml = '';
            if (p.routeDest) {
                buttonsHtml += `<button class="btn-route" data-route-dest="${p.routeDest}"><i class="fas fa-route"></i> Построить маршрут</button>`;
            }
            if (p.website) {
                buttonsHtml += `<a href="${p.website}" target="_blank" class="btn-route" style="background:linear-gradient(135deg,#2c7a4b,#1e5c38)"><i class="fas fa-globe"></i> Официальный сайт</a>`;
            }
            if (p.phone) {
                buttonsHtml += `<a href="tel:${p.phone}" class="btn-route btn-call"><i class="fas fa-phone"></i> Позвонить</a>`;
            }
            actionsEl.innerHTML = buttonsHtml;
        }

        overlay.classList.add('active');
        document.body.classList.add('modal-open');
        document.documentElement.classList.add('modal-open');
    }

    function closeDetailModal() {
        overlay.classList.remove('active');
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
    }

    // Global listener for "Details" buttons (delegated)
    document.addEventListener('click', e => {
        const btn = e.target.closest('.btn-details[data-guide-id]');
        if (btn) {
            e.preventDefault();
            openDetailModal(btn.dataset.guideId);
        }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeDetailModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeDetailModal(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) closeDetailModal();
    });
}
