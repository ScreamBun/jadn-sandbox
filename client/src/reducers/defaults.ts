import { TOGGLE_DEFAULTS } from '../actions/defaults';

const initialState = false;

export default function toggleDefaultsReducer(state = initialState, action: any) {
    switch (action.type) {
        case TOGGLE_DEFAULTS:
            if (typeof action.payload === 'boolean') {
                return action.payload;
            }
            return !state;
        default:
            return state;
    }
}