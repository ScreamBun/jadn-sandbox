// Actions for convert API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';

// API Base URL
const baseAPI = '/api/save';

// Helper Functions
// None

// POST - /api/save/ - save file to list
const SAVE_REQUEST = '@@save/SAVE_REQUEST';
export const SAVE_SUCCESS = '@@save/SAVE_SUCCESS';
export const SAVE_FAILURE = '@@save/SAVE_FAILURE';
export const saveFile = (name: string, file_data: string, loc: 'schemas' | 'messages', overwrite: boolean) => createAction({
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
        SAVE_REQUEST, SAVE_SUCCESS, SAVE_FAILURE
    ]
});

// POST - /api/save/delete - delete file from list
const DELETE_REQUEST = '@@save/DELETE_REQUEST';
export const DELETE_SUCCESS = '@@save/DELETE_SUCCESS';
export const DELETE_FAILURE = '@@save/DELETE_FAILURE';
export const deleteFile = (name: string | string[], loc: 'schemas' | 'messages') => createAction({
    endpoint: `${baseAPI}/delete`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        'filename': name,
        'loc': loc,
    }),
    types: [
        DELETE_REQUEST, DELETE_SUCCESS, DELETE_FAILURE
    ]
});

export interface FileSuccessAction extends ActionSuccessResult {
    type: typeof SAVE_SUCCESS | typeof DELETE_SUCCESS;
    payload: {
        file_status: string
    };
}

// Request Actions
export interface FileRequestActions extends ActionRequestResult {
    type: typeof SAVE_REQUEST | typeof DELETE_REQUEST;
}

// Failure Actions
export interface FileFailureActions extends ActionFailureResult {
    type: typeof SAVE_FAILURE | typeof DELETE_FAILURE;
}

export type SaveActions = (
    FileRequestActions | FileFailureActions |
    // Success Actions
    FileSuccessAction
);
