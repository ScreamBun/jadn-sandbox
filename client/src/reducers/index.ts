import { Reducer, combineReducers } from 'redux';
import { History } from 'history';
import { LocationChangeAction, RouterState, connectRouter } from 'connected-react-router';
import convert, { ConvertState } from './convert';
import util, { UtilState } from './util';
import validate, { ValidateState } from './validate';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import format, { FormatState } from './format';
import transform, { TransformState } from './transform';
import validateField, { ValidateFieldState } from './validatefield';

export interface RootState {  // export so store.ts import is valid
  router: Reducer<RouterState<History>, LocationChangeAction<History>>; // MUST BE 'router'
  // Custom Reducers
  Convert: ConvertState;
  Util: UtilState;
  Validate: ValidateState;
  Format: FormatState;
  Transform: TransformState;
  ValidateField: ValidateFieldState;
}

export default (history: History) => combineReducers({
  router: connectRouter(history), // MUST BE 'router'
  // Custom Reducers
  Convert: convert,
  Util: util,
  Validate: validate,
  Format: format,
  Transform: transform,
  ValidateField: validateField
});

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
