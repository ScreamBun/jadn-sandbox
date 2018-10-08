import jwtDecode from 'jwt-decode'
import * as validate from '../actions/validate'

const initialState = {
    messages: {},
    schemas: [],
	error: {},
	valid: {
	    message: {},
		schema: {}
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

		case validate.VALIDATE_SCHEMA_SUCCESS:
			return {
			    ...state,
			    valid: {
			        ...state.valid,
			        schema: action.payload
			    }
			}

		case validate.VALIDATE_MESSAGE_SUCCESS:
			return {
			    ...state,
			    valid: {
			        ...state.valid,
			        message: action.payload
			    }
			}
			
        case validate.INFO_FAILURE:
		case validate.SCHEMA_FAILURE:
		case validate.VALIDATE_FAILURE:
		    console.log(action.payload)
            return {
                ...state,
                error: action.payload.valid_msg || action.payload.error || 'ERROR'
            }

        default:
            return state
    }
}
