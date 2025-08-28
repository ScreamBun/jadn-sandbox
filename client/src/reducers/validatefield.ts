export interface ValidateFieldState {
  fieldErrors: Record<string, string>;    
  validating: Record<string, boolean>;     
  error: string | null;                     
}

const initialState: ValidateFieldState = {
  fieldErrors: {},
  validating: {},
  error: null
};

// Import action constants & types from actions file
import {
  VALIDATE_FIELD_REQUEST,
  VALIDATE_FIELD_SUCCESS,
  VALIDATE_FIELD_FAILURE,
  VALIDATE_FIELD_CLEAR,
  RESET_FIELD_VALIDATION,
  ValidateFieldActions
} from 'actions/validatefield';

export default function validateFieldReducer(
  state: ValidateFieldState = initialState,
  action: ValidateFieldActions
): ValidateFieldState {
  switch (action.type) {
    case VALIDATE_FIELD_REQUEST: {
      const { field } = action.payload;
      return {
        ...state,
        validating: { ...state.validating, [field]: true }
      };
    }
    case VALIDATE_FIELD_SUCCESS: {
      const { field, message } = action.payload;
      const { [field]: _flag, ...restValidating } = state.validating;
      return {
        ...state,
        validating: restValidating,
        fieldErrors: { ...state.fieldErrors, [field]: message },
        error: null
      };
    }
    case VALIDATE_FIELD_FAILURE: {
      const { field, error } = action.payload;
      const { [field]: _flag, ...restValidating } = state.validating;
      return {
        ...state,
        validating: restValidating,
        fieldErrors: { ...state.fieldErrors, [field]: error },
        error
      };
    }
    case VALIDATE_FIELD_CLEAR: {
      const f = action.payload.field;
      if (f) {
        const { [f]: _err, ...restErrors } = state.fieldErrors;
        const { [f]: _val, ...restValidating } = state.validating;
        return { ...state, fieldErrors: restErrors, validating: restValidating };
      }
      return { ...state, fieldErrors: {}, validating: {} };
    }
    case RESET_FIELD_VALIDATION:
      return initialState;
    default:
      return state;
  }
}

export const getFieldError = (state: { ValidateField: ValidateFieldState }, field: string): string =>
  state.ValidateField.fieldErrors[field] || '';
export const isFieldValid = (state: { ValidateField: ValidateFieldState }, field: string): boolean =>
  getFieldError(state, field) === '';
export const isFieldValidating = (state: { ValidateField: ValidateFieldState }, field: string): boolean =>
  !!state.ValidateField.validating[field];
export const getAllFieldErrors = (state: { ValidateField: ValidateFieldState }) => state.ValidateField.fieldErrors;
