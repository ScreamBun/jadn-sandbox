import storage from 'redux-persist/es/storage';
import {
    Store, StoreEnhancer, applyMiddleware, compose
 } from 'redux';
import { configureStore } from '@reduxjs/toolkit'
import { apiMiddleware } from 'redux-api-middleware';
import { History, createBrowserHistory } from 'history';
import reduxThunk from 'redux-thunk';
import { persistReducer, persistStore } from 'redux-persist';
import { routerMiddleware } from 'connected-react-router';

import { DispatchAction } from './actions';
import createRootReducer, { RootState } from './reducers';

type LintStore = Store<RootState, DispatchAction>;
export const history = createBrowserHistory();

export default (his: History = history): any => {
  const reducer = persistReducer(
    {
      key: 'jadn_lint',
      storage,
      whitelist: [],
      blacklist: ['router']
    },
    createRootReducer(his)
  );

  const middleware = [
    apiMiddleware,
    reduxThunk,
    routerMiddleware(his)
  ];

  const extraEnhancers: Array<StoreEnhancer> = [];

  /* Logger */
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line global-require
    const { createLogger } = require('redux-logger');
    const logger = createLogger({
      diff: false,
      level: 'info',
      logErrors: true
    });
    middleware.push(logger);
    // extraEnhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
  }

  // TODO: May need to tie this into the store....
  const enhancers: StoreEnhancer = compose(
    applyMiddleware(...middleware),
    ...extraEnhancers
  );

  const store = configureStore({
    reducer: {},
  });

  persistStore(store);

  return store;
};
