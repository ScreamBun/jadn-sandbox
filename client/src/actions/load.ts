// Actions for convert API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';

// API Base URL
const baseAPI = '/api/upload';

// Helper Functions
// None

// POST - /api/upload/ - upload schema to list
const LOAD_REQUEST = '@@load/LOAD_REQUEST';
export const LOAD_SUCCESS = '@@load/LOAD_SUCCESS';
export const LOAD_FAILURE = '@@load/LOAD_FAILURE';
export const uploadSchema = (name: string, file_data: string, loc: 'schemas' | 'messages', overwrite: boolean) => createAction({
    endpoint: `${baseAPI}/`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        'filename': name,
        'filedata': file_data,
        'loc': loc,
        'overwrite': overwrite
    }),
    types: [
        LOAD_REQUEST, LOAD_SUCCESS, LOAD_FAILURE
    ]
});

export interface LoadSchemaSuccessAction extends ActionSuccessResult {
    type: typeof LOAD_SUCCESS;
    payload: {
        file_upload_status: string
    };
}

// Request Actions
export interface LoadRequestActions extends ActionRequestResult {
    type: typeof LOAD_REQUEST;
}

// Failure Actions
export interface LoadFailureActions extends ActionFailureResult {
    type: typeof LOAD_FAILURE;
}

export type LoadActions = (
    LoadRequestActions | LoadFailureActions |
    // Success Actions
    LoadSchemaSuccessAction
);
