import storage from 'redux-persist/es/storage'
import { apiMiddleware, isRSAA } from 'redux-api-middleware';
import { applyMiddleware, createStore } from 'redux'
import { persistReducer, persistStore } from 'redux-persist'
import { routerMiddleware } from 'connected-react-router'

import createRootReducer from './reducers'

export default (history) => {
    const reducer = persistReducer(
        {
            key: 'orc_gui',
            storage: storage,
            whitelist: []
        },
        createRootReducer(history)
    )

    let middleware = [
        apiMiddleware,
        routerMiddleware(history)
    ]

    /* Logger */
    if (process.env.NODE_ENV === 'development') {
        const { createLogger } = require('redux-logger');

        const logger = createLogger({
            diff: false,
            level: 'info',
            logErrors: true
        });

        console.log('Apply Logger');
        //middleware.push(logger);
    }

    const store = createStore(
        reducer,
        {},
        applyMiddleware(
            ...middleware
        )
    )

    persistStore(store)

    return store
}
