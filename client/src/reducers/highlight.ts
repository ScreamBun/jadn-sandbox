import * as highlight from '../actions/highlight';

export interface HighlightState {
    error: Record<string, any>;
    highlightWords: string[];
}

const initialState: HighlightState = {
    error: {},
    highlightWords: [],
};

export default (state = initialState, action: highlight.HighlightActions) => {
    switch (action.type) {
        case highlight.HIGHLIGHT_SUCCESS:
            return {
                ...state,
                highlightWords: action.payload,
            };

        case highlight.HIGHLIGHT_CLEAR:
            return {
                ...state,
                highlightWords: [],
            };

        case highlight.HIGHLIGHT_FAILURE:
            return {
                ...state,
                error: action.payload.error || 'ERROR'
            };
        default:
            return state;
    }
};