import * as generate from '../actions/generate';

export interface GenerateState {
    schema: Record<string, any>;
    generated_examples: Array<Record<string, any>>;
    error: string;
}

const initialState: GenerateState = {
    schema: {},
    generated_examples: [],
    error: ''
};

export default (state = initialState, action: generate.GenerateActions) => {
    switch (action.type) {
        case generate.GENERATE_SUCCESS:
            return {
                ...state,
                generated_examples: action.payload.generated_examples || []
            };

        case generate.GENERATE_FAILURE:
            return {
                ...state,
                error: action.payload.error || 'ERROR'
            };

        default:
            return state;
    }
};