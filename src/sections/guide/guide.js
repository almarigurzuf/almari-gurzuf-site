import './guide.css';
import { fetchRegionData } from './data/provider.js';
import { renderCards } from './ui/renderer.js';
import { setupNavigation } from './ui/navigation.js';
import { setupModal } from './ui/modal.js';
import { openRouteWithGeolocation } from './utils/helpers.js';

export function initGuide() {
    const container = document.getElementById('guideCardsContainer');
    if (!container) return;

    const regionBtns = document.querySelectorAll('.guide-region-btn');
    const catBtns = document.querySelectorAll('.guide-cat-btn');
    const cityBtns = document.querySelectorAll('.guide-tab-btn');
    const cityGroups = document.querySelectorAll('.guide-city-group');
    const citiesRow = document.querySelector('.guide-cities-row');
    const categoriesRow = document.querySelector('.guide-categories-row');
    const cardsSection = container.closest('.container');

    // State cache
    let CACHED_PLACES = {};

    setupNavigation({
        regionBtns,
        catBtns,
        cityBtns,
        cityGroups,
        citiesRow,
        categoriesRow,
        cardsSection,
        // Provide a getter so navigation always sees the latest cached data
        getAllPlaces: () => CACHED_PLACES,
        onStateChange: async (state, forceUpdateNav) => {
            // If we selected a region, load its data if not already cached
            if (state.currentRegion) {
                // Show a loading state in the container
                if (!CACHED_PLACES[state.currentRegion + '_loaded']) {
                    container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 3rem; color: #666;"><i class="fas fa-spinner fa-spin"></i> Загрузка данных...</div>';
                    
                    const regionData = await fetchRegionData(state.currentRegion);
                    Object.assign(CACHED_PLACES, regionData);
                    CACHED_PLACES[state.currentRegion + '_loaded'] = true;
                    
                    // Re-run nav update now that we have data for category counts
                    if (forceUpdateNav) forceUpdateNav();
                }
            }

            // Always update modal bindings with latest data
            setupModal(CACHED_PLACES);

            // Render the cards
            renderCards(container, CACHED_PLACES, state);
        }
    });

    // Route button handler (cards + modal, delegated)
    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-route-dest]');
        if (btn) {
            e.preventDefault();
            openRouteWithGeolocation(btn.dataset.routeDest);
        }
    });

    // Initial render (empty state)
    renderCards(container, {}, {
        currentRegion: null,
        currentCity: null,
        currentCat: 'all'
    });
}
