// Actions for convert API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';

// API Base URL
const baseAPI = '/api/generate';

// Helper Functions
// None

// POST - /api/generate/ - generate list of valid example messages from schema 
const GENERATE_REQUEST = '@@generate/GENERATE_REQUEST';
export const GENERATE_SUCCESS = '@@generate/GENERATE_SUCCESS';
export const GENERATE_FAILURE = '@@generate/GENERATE_FAILURE';
export const generateExamples = (schema: Record<string, any>) => createAction({
    endpoint: `${baseAPI}/`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(schema),
    types: [
        GENERATE_REQUEST, GENERATE_SUCCESS, GENERATE_FAILURE
    ]
});

export interface GenerateSchemaSuccessAction extends ActionSuccessResult {
    type: typeof GENERATE_SUCCESS;
    payload: {
        generated_examples: Array<Record<string, any>>
    };
}

// Request Actions
export interface GenerateRequestActions extends ActionRequestResult {
    type: typeof GENERATE_REQUEST;
}

// Failure Actions
export interface GenerateFailureActions extends ActionFailureResult {
    type: typeof GENERATE_FAILURE;
}

export type GenerateActions = (
    GenerateRequestActions | GenerateFailureActions |
    // Success Actions
    GenerateSchemaSuccessAction
);
