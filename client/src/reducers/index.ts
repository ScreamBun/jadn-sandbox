import { Reducer, combineReducers } from 'redux';
import { History } from 'history';
import convert, { ConvertState } from './convert';
import util, { UtilState } from './util';
import validate, { ValidateState } from './validate';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import format, { FormatState } from './format';
import duplicate, { DuplicateState } from './duplicate';
import transform, { TransformState } from './transform';
import validateField, { ValidateFieldState } from './validatefield';
import highlight, { HighlightState } from './highlight'
import toggleGenDataReducer from './gendata';
import { createRouterReducer } from '@lagunovsky/redux-react-router';

type RouterReducerState = ReturnType<ReturnType<typeof createRouterReducer>>;
export interface RootState {  // export so store.ts import is valid
  router: RouterReducerState; // MUST BE 'router'
  // Custom Reducers
  Convert: ConvertState;
  Util: UtilState;
  Validate: ValidateState;
  Format: FormatState;
  Transform: TransformState;
  ValidateField: ValidateFieldState;
  Duplicate: DuplicateState;
  Highlight: HighlightState
}

export default (history: History) => combineReducers({
  router: createRouterReducer(history), // MUST BE 'router'
  // Custom Reducers
  Convert: convert,
  Util: util,
  Validate: validate,
  Format: format,
  Transform: transform,
  ValidateField: validateField,
  toggleGenData: toggleGenDataReducer,
  Duplicate: duplicate,
  Highlight: highlight
});

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
