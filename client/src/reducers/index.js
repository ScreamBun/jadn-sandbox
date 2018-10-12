import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import convert from './convert'
import generate from './generate'
import util from './util'
import validate from './validate'

export default combineReducers({
    'Convert': convert,
    'Generate': generate,
    'Router': routerReducer,
    'Util': util,
    'Validate': validate
})
