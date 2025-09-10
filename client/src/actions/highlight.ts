// Actions for utils API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';

// API Base URL
const baseAPI = '/api/highlight';

// POST - /api/highlight - highlight data
const HIGHLIGHT_REQUEST = '@@util/HIGHLIGHT_REQUEST';
export const HIGHLIGHT_SUCCESS = '@@util/HIGHLIGHT_SUCCESS';
export const HIGHLIGHT_FAILURE = '@@util/HIGHLIGHT_FAILURE';
export const HIGHLIGHT_CLEAR = '@@util/HIGHLIGHT_CLEAR';
export const highlight = (highlightWords: string[]) => createAction({
    endpoint: `${baseAPI}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ props: highlightWords }),
    types: [
        HIGHLIGHT_REQUEST, HIGHLIGHT_SUCCESS, HIGHLIGHT_FAILURE
    ]
});

export const clearHighlight = (): { type: typeof HIGHLIGHT_CLEAR } => ({ type: HIGHLIGHT_CLEAR });

export interface HighlightSuccessAction extends ActionSuccessResult {
    type: typeof HIGHLIGHT_SUCCESS;
}

// GET - /api/highlight/options - get valid highlight options
// Request Actions
export interface HighlightRequestActions extends ActionRequestResult {
    type: typeof HIGHLIGHT_REQUEST;
}

// Failure Actions
export interface HighlightFailureActions extends ActionFailureResult {
    type: typeof HIGHLIGHT_FAILURE;
}

export type HighlightActions =
    HighlightRequestActions | HighlightFailureActions |
    HighlightSuccessAction | ReturnType<typeof clearHighlight>;
