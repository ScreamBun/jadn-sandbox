import * as transform from '../actions/transform';

export interface TransformState {
    valid_transformations: Array<string>;
    schema_list: Array<Record<string, any>>;
    transformed_schema: Record<string, any>;
    error: Array<Record<string, any>>;
}

const initialState: TransformState = {
    valid_transformations: [],
    schema_list: [],
    transformed_schema: {},
    error: []
};

export default (state = initialState, action: transform.TransformActions) => {
    switch (action.type) {
        case transform.INFO_SUCCESS:
            return {
                ...state,
                valid_transformations: action.payload.transformations || [],
            };

        case transform.TRANSFORM_SUCCESS:
            return {
                ...state,
                transformed_schema: action.payload.transformed_schema || {}
            };

        case transform.INFO_FAILURE:
        case transform.TRANSFORM_FAILURE:
            return {
                ...state,
                error: action.payload.error || 'ERROR'
            };

        default:
            return state;
    }
};

//selectors
export const getValidTransformations = (state: { Transform: { valid_transformations: any; }; }) => state.Transform.valid_transformations;