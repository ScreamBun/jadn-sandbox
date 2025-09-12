// Actions for utils API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';
import { SchemaJADN } from 'components/create/schema/interface';

// API Base URL
const baseAPI = '/api/globalschema';

// POST - /api/highlight - highlight data
const GLOBALSCHEMA_REQUEST = '@@util/GLOBALSCHEMA_REQUEST';
export const GLOBALSCHEMA_SUCCESS = '@@util/GLOBALSCHEMA_SUCCESS';
export const GLOBALSCHEMA_FAILURE = '@@util/GLOBALSCHEMA_FAILURE';
export const GLOBALSCHEMA_CLEAR = '@@util/GLOBALSCHEMA_CLEAR';

export const setGlobalSchema = (file: string, schema: SchemaJADN) => createAction({
    endpoint: `${baseAPI}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        file,
        schema
    }),
    types: [
        GLOBALSCHEMA_REQUEST, GLOBALSCHEMA_SUCCESS, GLOBALSCHEMA_FAILURE
    ]
});

export const clearGlobalSchema = (): { type: typeof GLOBALSCHEMA_CLEAR } => ({ type: GLOBALSCHEMA_CLEAR });

export interface setGlobalSchemaSuccessAction extends ActionSuccessResult {
    type: typeof GLOBALSCHEMA_SUCCESS;
}

// GET - /api/highlight/options - get valid highlight options
// Request Actions
export interface GlobalSchemaRequestActions extends ActionRequestResult {
    type: typeof GLOBALSCHEMA_REQUEST;
}

// Failure Actions
export interface GlobalSchemaFailureActions extends ActionFailureResult {
    type: typeof GLOBALSCHEMA_FAILURE;
}

export type GlobalSchemaActions =
    GlobalSchemaRequestActions | GlobalSchemaFailureActions |
    setGlobalSchemaSuccessAction | ReturnType<typeof clearGlobalSchema>;
