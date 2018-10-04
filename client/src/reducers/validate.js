import jwtDecode from 'jwt-decode'
import * as validate from '../actions/validate'

const initialState = {
    messages: {},
    schemas: [],
	error: {},
	loaded: {
		messages: {},
		schemas: {}
	}
}

export default (state=initialState, action=null) => {
    switch(action.type) {
        case validate.INFO_SUCCESS:
            return {
				...state,
				messages: action.payload.messages || {},
    			schemas: action.payload.schemas || [],
				error: {}
            }
		
		case validate.LOAD_SUCCESS:
			let tmp_state = { ...state }
			tmp_state.loaded[action.payload.type][action.payload.file] = action.payload.data
			return tmp_state

		case validate.VALIDATE_SUCCESS:
		    console.log(action.payload)
			return state
			
        case validate.INFO_FAILURE:
		case validate.SCHEMA_FAILURE:
		case validate.LOAD_FAILURE:
		    console.log(action.payload)
            return {
                error: action.payload.error || 'ERROR'
            }

        default:
            return state
    }
}
