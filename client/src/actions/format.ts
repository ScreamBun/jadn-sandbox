// Actions for utils API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';

// API Base URL
const baseAPI = '/api/format';

// POST - /api/format - format data
const FORMAT_REQUEST = '@@util/FORMAT_REQUEST';
export const FORMAT_SUCCESS = '@@util/FORMAT_SUCCESS';
export const FORMAT_FAILURE = '@@util/FORMAT_FAILURE';
export const format = (schema: string) => createAction({
    endpoint: `${baseAPI}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: schema,
    types: [
        FORMAT_REQUEST, FORMAT_SUCCESS, FORMAT_FAILURE
    ]
});

export interface FormatSuccessAction extends ActionSuccessResult {
    type: typeof FORMAT_SUCCESS;
}

// GET - /api/format/options - get valid format options
const VALID_FORMAT_OPTIONS_REQUEST = '@@util/VALID_FORMAT_OPTIONS_REQUEST';
export const VALID_FORMAT_OPTIONS_SUCCESS = '@@util/VALID_FORMAT_OPTIONS_SUCCESS';
export const VALID_FORMAT_OPTIONS_FAILURE = '@@util/VALID_FORMAT_OPTIONS_FAILURE';
export const getValidFormatOpts = (type: string) => createAction({
    endpoint: `${baseAPI}/options/${type}`,
    method: 'GET',
    types: [
        VALID_FORMAT_OPTIONS_REQUEST, VALID_FORMAT_OPTIONS_SUCCESS, VALID_FORMAT_OPTIONS_FAILURE
    ]
});

export interface getValidFormatSuccessAction extends ActionSuccessResult {
    type: typeof VALID_FORMAT_OPTIONS_SUCCESS;
}

// Request Actions
export interface FormatRequestActions extends ActionRequestResult {
    type: typeof FORMAT_REQUEST | typeof VALID_FORMAT_OPTIONS_REQUEST;
}

// Failure Actions
export interface FormatFailureActions extends ActionFailureResult {
    type: typeof FORMAT_FAILURE | typeof VALID_FORMAT_OPTIONS_FAILURE;
}

export type FormatActions = (
    FormatRequestActions | FormatFailureActions |
    // Success Actions
    FormatSuccessAction | getValidFormatSuccessAction
);
