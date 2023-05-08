// Actions for convert API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';

// API Base URL
const baseAPI = '/api/convert';

// Helper Functions
// None

// API Calls
// GET - /api/convert/ - convert basic info
const INFO_REQUEST = '@@convert/INFO_REQUEST';
export const INFO_SUCCESS = '@@convert/INFO_SUCCESS';
export const INFO_FAILURE = '@@convert/INFO_FAILURE';
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
    conversions: Record<string, any>;
  };
}

// POST - /api/convert/ - convert the given schema to a different format
const CONVERT_REQUEST = '@@convert/CONVERT_REQUEST';
export const CONVERT_SUCCESS = '@@convert/CONVERT_SUCCESS';
export const CONVERT_FAILURE = '@@convert/CONVERT_FAILURE';
export const convertSchema = (schema: Record<string, any>, t: string) => createAction({
  endpoint: `${baseAPI}/`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    schema,
    'convert-to': t
  }),
  types: [
    CONVERT_REQUEST, CONVERT_SUCCESS, CONVERT_FAILURE
  ]
});

// POST - /api/convert/all - convert the given schema to a different format
const CONVERTTOALL_REQUEST = '@@convert/CONVERTTOALL_REQUEST';
export const CONVERTTOALL_SUCCESS = '@@convert/CONVERTTOALL_SUCCESS';
export const CONVERTTOALL_FAILURE = '@@convert/CONVERTTOALL_FAILURE';
export const convertToAll = (schema: Record<string, any>, convertType: string) => createAction({
  endpoint: `${baseAPI}/all`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    schema,
    convertType
  }),
  types: [
    CONVERTTOALL_REQUEST, CONVERTTOALL_SUCCESS, CONVERTTOALL_FAILURE
  ]
});

export interface ConvertSchemaSuccessAction extends ActionSuccessResult {
  type: typeof CONVERT_SUCCESS;
  payload: {
    schema: {
      base: string;
      convert: string;
    };
  };
}

export interface ConvertToAllSchemaSuccessAction extends ActionSuccessResult {
  type: typeof CONVERTTOALL_SUCCESS;
  payload: {
    schema: {
      base: string;
      convert: Array<any>;
    };
  }
}
// Request Actions
export interface ConvertRequestActions extends ActionRequestResult {
  type: typeof INFO_REQUEST | typeof CONVERT_REQUEST | typeof CONVERTTOALL_REQUEST;
}

// Failure Actions
export interface ConvertFailureActions extends ActionFailureResult {
  type: typeof INFO_FAILURE | typeof CONVERT_FAILURE | typeof CONVERTTOALL_FAILURE;
}

export type ConvertActions = (
  ConvertRequestActions | ConvertFailureActions |
  // Success Actions
  InfoSuccessAction | ConvertSchemaSuccessAction | ConvertToAllSchemaSuccessAction
);
