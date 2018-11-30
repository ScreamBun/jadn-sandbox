import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import convert from './convert'
import generate from './generate'
import util from './util'
import validate from './validate'

export default (history) => combineReducers({
    'Convert': convert,
    'Generate': generate,
    'router': connectRouter(history), // MUST BE 'router'
    'Util': util,
    'Validate': validate
})
