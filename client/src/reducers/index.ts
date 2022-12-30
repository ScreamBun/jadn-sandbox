import { Reducer, combineReducers } from 'redux';
import { History } from 'history';
import { LocationChangeAction, RouterState, connectRouter } from 'connected-react-router';
import convert, { ConvertState } from './convert';
import generate, { GenerateState } from './generate';
import util, { UtilState } from './util';
import validate, { ValidateState } from './validate';

export interface RootState {
  router: Reducer<RouterState<History>, LocationChangeAction<History>>; // MUST BE 'router'
  // Custom Reducers
  Convert: ConvertState;
  Generate: GenerateState;
  Util: UtilState;
  Validate: ValidateState;
}

export default (history: History) => combineReducers({
  router: connectRouter(history), // MUST BE 'router'
  // Custom Reducers
  Convert: convert,
  Generate: generate,
  Util: util,
  Validate: validate
});
