import storage from 'redux-persist/es/storage'
import { apiMiddleware, isRSAA } from 'redux-api-middleware';
import { applyMiddleware, createStore } from 'redux'
import { createFilter } from 'redux-persist-transform-filter';
import { persistReducer, persistStore } from 'redux-persist'
import { routerMiddleware } from 'react-router-redux'
import rootReducer from './reducers'


export default (history) => {
    const persistedFilter = createFilter(
        'Auth', ['access']
    );

    const reducer = persistReducer(
        {
            key: 'orc_gui',
            storage: storage,
            whitelist: []
            //transforms: [persistedFilter]
        },
        rootReducer
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
