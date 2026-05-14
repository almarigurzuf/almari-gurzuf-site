export async function fetchRegionData(regionId) {
    let places = {};
    try {
        switch (regionId) {
            case 'south':
                const southModule = await import('./regions/south.js');
                places = southModule.SOUTH_PLACES;
                break;
            case 'west':
                const westModule = await import('./regions/west.js');
                places = westModule.WEST_PLACES;
                break;
            case 'east':
                const eastModule = await import('./regions/east.js');
                places = eastModule.EAST_PLACES;
                break;
            case 'north':
                const northModule = await import('./regions/north.js');
                places = northModule.NORTH_PLACES;
                break;
            case 'all':
            default:
                // For 'all' or initial load without specific region
                const allModule = await import('./regions/all.js');
                places = allModule.ALL_PLACES || {};
                break;
        }
    } catch (error) {
        console.error(`Failed to load data for region ${regionId}`, error);
    }

    // Ensure all places have region and city populated correctly (fallback)
    const enriched = {};
    for (const key in places) {
        const place = { ...places[key] };
        if (!place.region) place.region = regionId === 'all' ? 'south' : regionId;
        if (!place.category) place.category = 'history';
        if (!place.city) place.city = 'yalta'; // Ultimate fallback
        enriched[key] = place;
    }

    return enriched;
}
