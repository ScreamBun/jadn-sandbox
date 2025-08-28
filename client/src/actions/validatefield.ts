import { createAction } from 'redux-api-middleware';

// Constants
export const VALIDATE_FIELD_REQUEST = '@@validatefield/VALIDATE_FIELD_REQUEST';
export const VALIDATE_FIELD_SUCCESS = '@@validatefield/VALIDATE_FIELD_SUCCESS';
export const VALIDATE_FIELD_FAILURE = '@@validatefield/VALIDATE_FIELD_FAILURE';
export const VALIDATE_FIELD_CLEAR   = '@@validatefield/VALIDATE_FIELD_CLEAR';
export const RESET_FIELD_VALIDATION = '@@validatefield/RESET_FIELD_VALIDATION';

// Interfaces
export interface ValidateFieldRequestAction { type: typeof VALIDATE_FIELD_REQUEST; payload: { field: string; message?: string }; }
export interface ValidateFieldSuccessAction { type: typeof VALIDATE_FIELD_SUCCESS; payload: { field: string; message: string }; }
export interface ValidateFieldFailureAction { type: typeof VALIDATE_FIELD_FAILURE; payload: { field: string; error: string }; }
export interface ValidateFieldClearAction   { type: typeof VALIDATE_FIELD_CLEAR;   payload: { field?: string }; }
export interface ResetFieldValidationAction { type: typeof RESET_FIELD_VALIDATION; }

export type ValidateFieldActions =
  | ValidateFieldRequestAction
  | ValidateFieldSuccessAction
  | ValidateFieldFailureAction
  | ValidateFieldClearAction
  | ResetFieldValidationAction;

export const validateField = (
  field: string,
  value: any,
  valueType: string,
  options: string[]
) => createAction({
  endpoint: '/api/validate/field',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ value, type: valueType, options }),
  types: [
    { type: VALIDATE_FIELD_REQUEST, payload: { field, message: '' } },
    // Success: map response -> { field, message }
    {
      type: VALIDATE_FIELD_SUCCESS,
      payload: async (_action, _state, res) => {
        let data: any = {};
        try { data = await res.json(); } catch { /* ignore */ }
        const message = data && data.valid ? '' : (data.message || 'Invalid');
        return { field, message };
      }
    },
    // Failure: map response -> { field, error }
    {
      type: VALIDATE_FIELD_FAILURE,
      payload: (async (_action: any, _state: any, res: any) => {
        try {
          const data = await res.json();
            return { field, error: data.message || data.error || 'Validation failed' };
        } catch {
          return { field, error: 'Validation failed' };
        }
      }) as any
    }
  ]
});

export const clearFieldValidation = (field?: string): ValidateFieldClearAction => ({
  type: VALIDATE_FIELD_CLEAR,
  payload: { field }
});

export const resetFieldValidation = (): ResetFieldValidationAction => ({
  type: RESET_FIELD_VALIDATION
});
