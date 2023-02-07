import { Reducer, combineReducers } from 'redux';
import { History } from 'history';
import { LocationChangeAction, RouterState, connectRouter } from 'connected-react-router';
import convert, { ConvertState } from './convert';
import util, { UtilState } from './util';
import validate, { ValidateState } from './validate';
import { TypedUseSelectorHook, useSelector } from 'react-redux';

interface RootState {
  router: Reducer<RouterState<History>, LocationChangeAction<History>>; // MUST BE 'router'
  // Custom Reducers
  Convert: ConvertState;
  Util: UtilState;
  Validate: ValidateState;
}

export default (history: History) => combineReducers({
  router: connectRouter(history), // MUST BE 'router'
  // Custom Reducers
  Convert: convert,
  Util: util,
  Validate: validate
});

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
