import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import generator from './generator'
import util from './util'
import validate from './validate'

export default combineReducers({
    'Generator': generator,
    'Router': routerReducer,
    'Util': util,
    'Validate': validate
})
