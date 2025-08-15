import { TOGGLE_DEFAULTS } from '../actions/defaults';

const initialState = false;

export default function toggleDefaultsReducer(state = initialState, action: any) {
    switch (action.type) {
        case TOGGLE_DEFAULTS:
            return !state;
        default:
            return state;
    }
}