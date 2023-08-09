// Actions for convert API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';

// API Base URL
const baseAPI = '/api/transform';

// Helper Functions
// None

// GET - /api/transform/ - transform basic info
const INFO_REQUEST = '@@transform/INFO_REQUEST';
export const INFO_SUCCESS = '@@transform/INFO_SUCCESS';
export const INFO_FAILURE = '@@transform/INFO_FAILURE';
export const info = () => createAction({
    endpoint: `${baseAPI}/`,
    method: 'GET',
    types: [
        INFO_REQUEST, INFO_SUCCESS, INFO_FAILURE
    ]
});

export interface InfoSuccessAction extends ActionSuccessResult {
    type: typeof INFO_SUCCESS;
    payload: {
        transformations: Array<string>;
    };
}

// POST - /api/transform/ - transform list of schemas 
const TRANSFORM_REQUEST = '@@transform/TRANSFORM_REQUEST';
export const TRANSFORM_SUCCESS = '@@transform/TRANSFORM_SUCCESS';
export const TRANSFORM_FAILURE = '@@transform/TRANSFORM_FAILURE';
export const transformSchema = (schema_list_data: Array<Record<string, any>>, transformationType: string, schema_base?: string) => createAction({
    endpoint: `${baseAPI}/`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        schema_list: schema_list_data,
        transformation_type: transformationType,
        schema_base: schema_base
    }),
    types: [
        TRANSFORM_REQUEST, TRANSFORM_SUCCESS, TRANSFORM_FAILURE
    ]
});

export interface TransformSchemaSuccessAction extends ActionSuccessResult {
    type: typeof TRANSFORM_SUCCESS;
    payload: {
        transformed_schema: Record<string, any>;
    };
}

// Request Actions
export interface TransformRequestActions extends ActionRequestResult {
    type: typeof INFO_REQUEST | typeof TRANSFORM_REQUEST;
}

// Failure Actions
export interface TransformFailureActions extends ActionFailureResult {
    type: typeof INFO_FAILURE | typeof TRANSFORM_FAILURE;
}

export type TransformActions = (
    TransformRequestActions | TransformFailureActions |
    // Success Actions
    InfoSuccessAction | TransformSchemaSuccessAction
);
