// Actions for utils API
import { SchemaJADN } from 'components/create/schema/interface';
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';

// API Base URL
const baseAPI = '/api';

// OPTIONS - set generated data
export const GENERATED_DATA_DEFINE = '@@util/GENERATED_DATA_DEFINE';
export const GENERATED_DATA_SUCCESS = '@@util/GENERATED_DATA_SUCCESS';
export const GENERATED_DATA_FAILURE = '@@util/GENERATED_DATA_FAILURE';
export const setGeneratedData = (data: Record<string, any>) => createAction({
  endpoint: `${baseAPI}/`,
  method: 'OPTIONS',
  types: [
    GENERATED_DATA_DEFINE,
    {
      type: GENERATED_DATA_SUCCESS,
      payload: (_action, _state) => ({ data })
    }, GENERATED_DATA_FAILURE
  ]
});

export interface SetGeneratedDataSuccessAction extends ActionSuccessResult {
  type: typeof GENERATED_DATA_SUCCESS;
  payload: {
    data: Record<string, any>;
  };
}

// Helper Functions
// OPTIONS - set schema for generating messages
export const SCHEMA_DEFINE = '@@util/SCHEMA_DEFINE';
export const SCHEMA_SUCCESS = '@@util/SCHEMA_SUCCESS';
export const SCHEMA_FAILURE = '@@util/SCHEMA_FAILURE';
export const setSchema = (schema: SchemaJADN | object | null) => createAction({
  endpoint: `${baseAPI}/`,
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

// OPTIONS- set schema file name
export const FILE_DEFINE = '@@util/FILE_DEFINE';
export const FILE_SUCCESS = '@@util/FILE_SUCCESS';
export const FILE_FAILURE = '@@util/FILE_FAILURE';
export const setFile = (file: {label: string, value: string} | null) => createAction({
  endpoint: `${baseAPI}/`,
  method: 'OPTIONS',
  types: [
    FILE_DEFINE,
    {
      type: FILE_SUCCESS,
      payload: (_action, _state) => ({ file })
    }, FILE_FAILURE
  ]
});

export interface SetFileSuccessAction extends ActionSuccessResult {
  type: typeof FILE_SUCCESS;
  payload: {
    file: {label: string, value: string} | null;
  };
}

// OPTIONS- set schema file name
export const SET_SCHEMA_VALID = '@@util/SET_SCHEMA_VALID';
export const setSchemaValid = (valid: boolean) => ({
  type: SET_SCHEMA_VALID,
  payload: { valid }
});

export interface SetSchemaValidAction {
  type: typeof SET_SCHEMA_VALID;
  payload: {
    valid: boolean;
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
  type: typeof INFO_REQUEST | typeof LOAD_REQUEST | typeof SCHEMA_DEFINE | typeof FILE_DEFINE | typeof SET_SCHEMA_VALID | typeof GENERATED_DATA_DEFINE;
}

// Failure Actions
export interface UtilFailureActions extends ActionFailureResult {
  type: typeof INFO_FAILURE | typeof LOAD_FAILURE | typeof SCHEMA_FAILURE | typeof FILE_FAILURE | typeof SET_SCHEMA_VALID | typeof GENERATED_DATA_FAILURE;
}

export type UtilActions = (
  UtilRequestActions | UtilFailureActions |
  // Success Actions
  InfoSuccessAction | LoadSuccessAction | SetSchemaSuccessAction | SetFileSuccessAction | SetSchemaValidAction | SetGeneratedDataSuccessAction
);