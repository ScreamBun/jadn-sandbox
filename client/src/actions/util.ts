// Actions for utils API
import { SchemaJADN } from 'components/create/schema/interface';
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';

// API Base URL
const baseAPI = '/api';

// Helper Functions
// OPTIONS - set schema locally for generating messages
export const SCHEMA_DEFINE = '@@util/SCHEMA_DEFINE';
export const SCHEMA_SUCCESS = '@@util/SCHEMA_SUCCESS';
export const SCHEMA_FAILURE = '@@util/SCHEMA_FAILURE';
export const setSchema = (schema: SchemaJADN | object | null) => createAction({
  endpoint: '',
  method: 'OPTIONS',
  types: [
    SCHEMA_DEFINE,
    {
      type: SCHEMA_SUCCESS,
      payload: (_action, _state) => ({ schema })
    }, SCHEMA_FAILURE
  ]
});

export interface SetSchemaSuccessAction extends ActionSuccessResult {
  type: typeof SCHEMA_SUCCESS;
  payload: {
    schema: SchemaJADN;
  };
}
// API Calls
// GET /api/ - basic server info
const INFO_REQUEST = '@@util/INFO_REQUEST';
export const INFO_SUCCESS = '@@util/INFO_SUCCESS';
export const INFO_FAILURE = '@@util/INFO_FAILURE';
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
    title: string;
    valid_msg_types: string[];
    message: string;
    schemas: Array<any>;
    messages: Record<string, any>;
    version_info: string;
  };
}

// GET - /api/load/{TYPE}/{FILE} - load a file from the server
const LOAD_REQUEST = '@@util/LOAD_REQUEST';
export const LOAD_SUCCESS = '@@util/LOAD_SUCCESS';
export const LOAD_FAILURE = '@@util/LOAD_FAILURE';
export const loadFile = (type: string, file: string) => createAction({
  endpoint: `${baseAPI}/load/${type}/${file}`,
  method: 'GET',
  types: [
    LOAD_REQUEST, LOAD_SUCCESS, LOAD_FAILURE
  ]
});

export interface LoadSuccessAction extends ActionSuccessResult {
  type: typeof LOAD_SUCCESS;
  payload: {
    type: 'messages' | 'schemas';
    name: string;
    data: Record<string, any>;
  };
}

// Request Actions
export interface UtilRequestActions extends ActionRequestResult {
  type: typeof INFO_REQUEST | typeof LOAD_REQUEST | typeof SCHEMA_DEFINE;
}

// Failure Actions
export interface UtilFailureActions extends ActionFailureResult {
  type: typeof INFO_FAILURE | typeof LOAD_FAILURE | typeof SCHEMA_FAILURE;
}

export type UtilActions = (
  UtilRequestActions | UtilFailureActions |
  // Success Actions
  InfoSuccessAction | LoadSuccessAction | SetSchemaSuccessAction
);
