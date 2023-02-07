import * as format from '../actions/format';

export interface FormatState {
    schema: string;
}

const initialState: FormatState = {
    schema: ''
};

export default (state = initialState, action: format.FormatActions) => {
    switch (action.type) {
        case format.FORMAT_SUCCESS:
            return {
                ...state,
                schema: action.payload.schema,
            };

        case format.FORMAT_FAILURE:
            return {
                ...state,
                error: action.payload.error || 'ERROR'
            };

        default:
            return state;
    }
};
