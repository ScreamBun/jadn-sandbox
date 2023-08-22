import { Reducer, combineReducers } from 'redux';
import { History } from 'history';
import { LocationChangeAction, RouterState, connectRouter } from 'connected-react-router';
import convert, { ConvertState } from './convert';
import util, { UtilState } from './util';
import validate, { ValidateState } from './validate';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import format, { FormatState } from './format';
import transform, { TransformState } from './transform';

interface RootState {
  router: Reducer<RouterState<History>, LocationChangeAction<History>>; // MUST BE 'router'
  // Custom Reducers
  Convert: ConvertState;
  Util: UtilState;
  Validate: ValidateState;
  Format: FormatState;
  Transform: TransformState;
}

export default (history: History) => combineReducers({
  router: connectRouter(history), // MUST BE 'router'
  // Custom Reducers
  Convert: convert,
  Util: util,
  Validate: validate,
  Format: format,
  Transform: transform
});

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
