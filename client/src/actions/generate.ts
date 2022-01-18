// Actions for generate API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';

// API Base URL
const baseAPI = '/api';

// Helper Functions
// OPTIONS - set schema locally for generating messages
export const SCHEMA_DEFINE = '@@generate/SCHEMA_DEFINE';
export const SCHEMA_SUCCESS = '@@generate/SCHEMA_SUCCESS';
export const SCHEMA_FAILURE = '@@generate/SCHEMA_FAILURE';
export const setSchema = (schema: Record<string, any>) => createAction({
  endpoint: '',
  method: 'OPTIONS',
  types: [
    {
      type: SCHEMA_DEFINE,
      payload: (_action, _state) => ({ schema })
      }, SCHEMA_SUCCESS, SCHEMA_FAILURE
    ]
});

export interface SetSchemaSuccessAction extends ActionSuccessResult {
  type: typeof SCHEMA_SUCCESS;
  payload: {
    schema: Record<string, any>;
  };
}

// API Calls
// GET - /api/create/ - get basic create info
const INFO_REQUEST = '@@generate/INFO_REQUEST';
export const INFO_SUCCESS = '@@generate/INFO_SUCCESS';
export const INFO_FAILURE = '@@generate/INFO_FAILURE';
export const info = () => createAction({
  endpoint: `${baseAPI}/create`,
  method: 'GET',
  types: [
    INFO_REQUEST, INFO_SUCCESS, INFO_FAILURE
  ]
});

export interface InfoSuccessAction extends ActionSuccessResult {
  type: typeof INFO_SUCCESS;
  payload: {
    schemas: Array<any>;
  };
}

// Request Actions
export interface GenerateRequestActions extends ActionRequestResult {
  type: typeof SCHEMA_DEFINE | typeof INFO_REQUEST;
}

// Failure Actions
export interface GenerateFailureActions extends ActionFailureResult {
  type: typeof SCHEMA_FAILURE | typeof INFO_FAILURE;
}

export type GenerateActions = (
  GenerateRequestActions | GenerateFailureActions |
  // Success Actions
  SetSchemaSuccessAction | InfoSuccessAction
);