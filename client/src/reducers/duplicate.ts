import * as duplicate from '../actions/duplicate';

export interface DuplicateState {
    error: Record<string, any>;
    item: Record<string, any> | null; // Store props/data, not JSX.Element
}

const initialState: DuplicateState = {
    error: {},
    item: null,
};

export default (state = initialState, action: duplicate.DuplicateActions) => {
    switch (action.type) {
        case duplicate.DUPLICATE_SUCCESS:
            return {
                ...state,
                item: action.payload.props, // Store returned props/data
            };

        case duplicate.DUPLICATE_CLEAR:
            return {
                ...state,
                item: null,
            };

        case duplicate.DUPLICATE_FAILURE:
            return {
                ...state,
                error: action.payload.error || 'ERROR'
            };
        default:
            return state;
    }
};