// Actions for convert API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';
import { SchemaJADN } from 'components/create/schema/interface';

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
    schema_conversions: string[];
    conversions: Record<string, any>;
    translations: Record<string, any>;
    visualizations: Record<string, any>;
  };
}

// POST - /api/convert/ - convert the given schema to a different format
const CONVERT_REQUEST = '@@convert/CONVERT_REQUEST';
export const CONVERT_SUCCESS = '@@convert/CONVERT_SUCCESS';
export const CONVERT_FAILURE = '@@convert/CONVERT_FAILURE';
export const convertSchema = (schema: SchemaJADN, schema_fmt: string, t: string[]) => createAction({
  endpoint: `${baseAPI}/`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'schema': schema,
    'schema_format': schema_fmt,
    'convert-to': t
  }),
  types: [
    CONVERT_REQUEST, CONVERT_SUCCESS, CONVERT_FAILURE
  ]
});

export interface ConvertSchemaSuccessAction extends ActionSuccessResult {
  type: typeof CONVERT_SUCCESS;
  payload: {
    schema: {
      base: string;
      convert: Array<string>;
    };
  };
}

// POST - /api/convert/convert_json - convert json to xml
const CONVERT_JSON_REQUEST = '@@convert/CONVERT_JSON_REQUEST';
export const CONVERT_JSON_SUCCESS = '@@convert/CONVERT_JSON_SUCCESS';
export const CONVERT_JSON_FAILURE = '@@convert/CONVERT_JSON_FAILURE';
export const convertJsonSchema = (json_schema: string, fmt: string, num_to_gen: number) => createAction({
  endpoint: `${baseAPI}/convert_json`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'json_schema': json_schema,
    'fmt': fmt,
    'num_to_gen': num_to_gen,
  }),
  types: [
    CONVERT_JSON_REQUEST, CONVERT_JSON_SUCCESS, CONVERT_JSON_FAILURE
  ]
});

export interface ConvertJsonSuccessAction extends ActionSuccessResult {
  type: typeof CONVERT_JSON_SUCCESS;
  payload: {
      data: any;
  };
}

// POST - /api/convert/convert_data - convert data to over languages
const CONVERT_DATA_REQUEST = '@@convert/CONVERT_DATA_REQUEST';
export const CONVERT_DATA_SUCCESS = '@@convert/CONVERT_DATA_SUCCESS';
export const CONVERT_DATA_FAILURE = '@@convert/CONVERT_DATA_FAILURE';
export const convertData = (data:string, from: string, to: string) => createAction({
  endpoint: `${baseAPI}/convert_data`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'data': data,
    'from': from,
    'to': to,
  }),
  types: [
    CONVERT_DATA_REQUEST, CONVERT_DATA_SUCCESS, CONVERT_DATA_FAILURE
  ]
});

export interface ConvertDataSuccessAction extends ActionSuccessResult {
  type: typeof CONVERT_DATA_SUCCESS;
  payload: {
      data: any;
  };
}

// JSON Request Actions
export interface ConvertDataActions extends ActionRequestResult {
  type: typeof CONVERT_DATA_REQUEST;
}

export interface ConvertJsonActions extends ActionRequestResult {
  type: typeof CONVERT_JSON_REQUEST;
}

// Request Actions
export interface ConvertRequestActions extends ActionRequestResult {
  type: typeof INFO_REQUEST | typeof CONVERT_REQUEST;
}

// Failure Actions
export interface ConvertFailureActions extends ActionFailureResult {
  type: typeof INFO_FAILURE | typeof CONVERT_FAILURE;
}

export type ConvertActions = (
  ConvertDataActions | ConvertJsonActions | ConvertRequestActions | ConvertFailureActions |
  // Success Actions
  ConvertDataSuccessAction | ConvertJsonSuccessAction | InfoSuccessAction | ConvertSchemaSuccessAction
);


