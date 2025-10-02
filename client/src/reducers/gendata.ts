import { TOGGLE_GEN_DATA } from '../actions/gendata';

const initialState = false;

export default function toggleGenDataReducer(state = initialState, action: any) {
    switch (action.type) {
        case TOGGLE_GEN_DATA:
            if (typeof action.payload === 'boolean') {
                return action.payload;
            }
            return !state;
        default:
            return state;
    }
}

export const getToggleGenData = (state: { toggleGenData: boolean }) => state.toggleGenData;