// Actions for convert API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';

// API Base URL
const baseAPI = '/api/transform';

// Helper Functions
// None

// POST - /api/transform/ - transform the list of schemas 
const TRANSFORM_REQUEST = '@@transform/TRANSFORM_REQUEST';
export const TRANSFORM_SUCCESS = '@@transform/TRANSFORM_SUCCESS';
export const TRANSFORM_FAILURE = '@@transform/TRANSFORM_FAILURE';
export const transformSchema = (schema_list: Array<Record<string, any>>) => createAction({
    endpoint: `${baseAPI}/`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        schema_list
    }),
    types: [
        TRANSFORM_REQUEST, TRANSFORM_SUCCESS, TRANSFORM_FAILURE
    ]
});

export interface TransformSchemaSuccessAction extends ActionSuccessResult {
    type: typeof TRANSFORM_SUCCESS;
    payload: {
        transformed_schema: string
    };
}

// Request Actions
export interface TransformRequestActions extends ActionRequestResult {
    type: typeof TRANSFORM_REQUEST;
}

// Failure Actions
export interface TransformFailureActions extends ActionFailureResult {
    type: typeof TRANSFORM_FAILURE;
}

export type TransformActions = (
    TransformRequestActions | TransformFailureActions |
    // Success Actions
    TransformSchemaSuccessAction
);
