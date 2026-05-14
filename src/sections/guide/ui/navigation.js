export function setupNavigation(config) {
    const { 
        regionBtns, 
        catBtns, 
        cityBtns, 
        cityGroups, 
        citiesRow, 
        categoriesRow, 
        cardsSection,
        getAllPlaces,
        onStateChange 
    } = config;


    let state = {
        currentRegion: null,
        currentCity: null,
        currentCat: 'all'
    };

    function updateNav() {
        regionBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.region === state.currentRegion));
        catBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.cat === state.currentCat));
        cityBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.city === state.currentCity));
        
        // Show/Hide rows based on selection
        if (citiesRow) citiesRow.classList.toggle('step-hidden', !state.currentRegion);
        if (categoriesRow) categoriesRow.classList.toggle('step-hidden', !state.currentCity);
        if (cardsSection) cardsSection.classList.toggle('step-hidden', !state.currentCity);

        cityGroups.forEach(group => {
            if (state.currentRegion && group.id === `cities-${state.currentRegion}`) {
                group.classList.add('active');
            } else {
                group.classList.remove('active');
            }
        });

        // Dynamic category visibility
        if (state.currentRegion && state.currentCity) {
            let catHidden = false;
            catBtns.forEach(btn => {
                const cat = btn.dataset.cat;
                if (cat === 'all') return;
                const allPlaces = getAllPlaces();
                const hasPlaces = Object.values(allPlaces).some(p => {
                    const regionMatch = (p.region === state.currentRegion || p.region === 'all');
                    const catMatch = (p.category === cat);
                    const cityMatch = (state.currentCity === 'all' || p.city === state.currentCity || p.city === 'all');
                    return regionMatch && catMatch && cityMatch;
                });
                btn.style.display = hasPlaces ? '' : 'none';
                if (!hasPlaces && cat === state.currentCat) {
                    catHidden = true;
                }
            });

            if (catHidden) {
                state.currentCat = 'all';
                return updateNav();
            }
        }
    }

    regionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (state.currentRegion === btn.dataset.region) {
                state.currentRegion = null;
                state.currentCity = null;
            } else {
                state.currentRegion = btn.dataset.region;
                state.currentCity = null;
            }
            state.currentCat = 'all';
            updateNav();
            onStateChange(state, updateNav);
        });
    });

    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentCat = (state.currentCat === btn.dataset.cat) ? 'all' : btn.dataset.cat;
            updateNav();
            onStateChange(state, updateNav);
        });
    });

    cityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentCity = (state.currentCity === btn.dataset.city) ? null : btn.dataset.city;
            updateNav();
            onStateChange(state, updateNav);
        });
    });

    // Initial state
    updateNav();
}
