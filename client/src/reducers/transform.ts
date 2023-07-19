import * as transform from '../actions/transform';

export interface TransformState {
    schema_list: Array<Record<string, any>>;
    transformed_schema: Record<string, any>;
    error: Array<Record<string, any>>;
}

const initialState: TransformState = {
    schema_list: [],
    transformed_schema: {},
    error: []
};

export default (state = initialState, action: transform.TransformActions) => {
    switch (action.type) {
        case transform.TRANSFORM_SUCCESS:
            return {
                ...state,
                transformed_schema: action.payload.transformed_schema || {}
            };

        case transform.TRANSFORM_FAILURE:
            return {
                ...state,
                error: action.payload.error || 'ERROR'
            };

        default:
            return state;
    }
};