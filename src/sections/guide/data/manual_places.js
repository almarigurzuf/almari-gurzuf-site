import { SOUTH_PLACES } from './regions/south.js';
import { WEST_PLACES } from './regions/west.js';
import { EAST_PLACES } from './regions/east.js';
import { NORTH_PLACES } from './regions/north.js';
import { ALL_PLACES } from './regions/all.js';

export const MANUAL_PLACES = {
    ...SOUTH_PLACES,
    ...WEST_PLACES,
    ...EAST_PLACES,
    ...NORTH_PLACES,
    ...ALL_PLACES
};
