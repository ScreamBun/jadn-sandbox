import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import convert from './convert'
import generator from './generator'
import util from './util'
import validate from './validate'

export default combineReducers({
    'Convert': convert,
    'Generator': generator,
    'Router': routerReducer,
    'Util': util,
    'Validate': validate
})
