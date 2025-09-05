// Actions for utils API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';

// API Base URL
const baseAPI = '/api/duplicate';

// POST - /api/duplicate - duplicate data
const DUPLICATE_REQUEST = '@@util/DUPLICATE_REQUEST';
export const DUPLICATE_SUCCESS = '@@util/DUPLICATE_SUCCESS';
export const DUPLICATE_FAILURE = '@@util/DUPLICATE_FAILURE';
export const DUPLICATE_CLEAR = '@@util/DUPLICATE_CLEAR';
// Accepts serializable props/data, not JSX element
export const duplicate = (propsData: Record<string, any>) => createAction({
    endpoint: `${baseAPI}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ props: propsData }),
    types: [
        DUPLICATE_REQUEST, DUPLICATE_SUCCESS, DUPLICATE_FAILURE
    ]
});

// Clear the stored duplicate item after it's been consumed by the UI
export const clearDuplicate = (): { type: typeof DUPLICATE_CLEAR } => ({ type: DUPLICATE_CLEAR });

export interface DuplicateSuccessAction extends ActionSuccessResult {
    type: typeof DUPLICATE_SUCCESS;
}

// GET - /api/duplicate/options - get valid duplicate options
// Request Actions
export interface DuplicateRequestActions extends ActionRequestResult {
    type: typeof DUPLICATE_REQUEST;
}

// Failure Actions
export interface DuplicateFailureActions extends ActionFailureResult {
    type: typeof DUPLICATE_FAILURE;
}

export type DuplicateActions =
    DuplicateRequestActions | DuplicateFailureActions |
    DuplicateSuccessAction | ReturnType<typeof clearDuplicate>;
