// Actions for validate API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';

// General Actions
export const VALIDATE_FAILURE = '@@validate/VALIDATE_FAILURE';

// API Base URL
const baseAPI = '/api/validate';

// Helper Functions
// None

// API Calls
// GET - /api/validate/ - get basic validate info
const INFO_REQUEST = '@@validate/INFO_REQUEST';
export const INFO_SUCCESS = '@@validate/INFO_SUCCESS';
export const INFO_FAILURE = '@@validate/INFO_FAILURE';
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
    messages: Record<string, any>;
    schemas: Record<string, any>;
  };
}

// POST - /api/validate/schema - validate the given schema
const VALIDATE_SCHEMA_REQUEST = '@@validate/VALIDATE_SCHEMA_REQUEST';
export const VALIDATE_SCHEMA_SUCCESS = '@@validate/VALIDATE_SCHEMA_SUCCESS';
export const validateSchema = (schema: Record<string, any>) => createAction({
  endpoint: `${baseAPI}/schema`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    schema
  }),
  types: [
    VALIDATE_SCHEMA_REQUEST, VALIDATE_SCHEMA_SUCCESS, VALIDATE_FAILURE
  ]
});

export interface ValidateSchemaSuccessAction extends ActionSuccessResult {
  type: typeof VALIDATE_SCHEMA_SUCCESS;
}

// POST - /api/validate - validate teh given message against the given schema
const VALIDATE_MESSAGE_REQUEST = '@@validate/VALIDATE_MESSAGE_REQUEST';
export const VALIDATE_MESSAGE_SUCCESS = '@@validate/VALIDATE_MESSAGE_SUCCESS';
export const validateMessage = (schema: Record<string, any>, message: Record<string, any>, format: string, decode: string) => createAction({
  endpoint: `${baseAPI}/`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    schema,
    message,
    'message-format': format,
    'message-decode': decode
  }),
  types: [
    VALIDATE_MESSAGE_REQUEST, VALIDATE_MESSAGE_SUCCESS, VALIDATE_FAILURE
  ]
});

export interface ValidateMessageSuccessAction extends ActionSuccessResult {
  type: typeof VALIDATE_MESSAGE_SUCCESS;
}

// Request Actions
export interface UtilRequestActions extends ActionRequestResult {
  type: typeof INFO_REQUEST | typeof VALIDATE_SCHEMA_REQUEST | typeof VALIDATE_MESSAGE_REQUEST;
}

// Failure Actions
export interface UtilFailureActions extends ActionFailureResult {
  type: typeof INFO_FAILURE | typeof VALIDATE_FAILURE;
}

export type ValidateActions = (
  UtilRequestActions | UtilFailureActions |
  // Success Actions
  InfoSuccessAction | ValidateSchemaSuccessAction | ValidateMessageSuccessAction
);
