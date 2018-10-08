import jwtDecode from 'jwt-decode'
import * as util from '../actions/util'

const initialState = {
    site_title: '',
    message: '',
    error: '',
    loaded: {
		messages: {},
		schemas: {}
	}
}

export default (state=initialState, action=null) => {
    switch(action.type) {
        case util.INFO_SUCCESS:
            return {
                ...state,
                site_title: action.payload.title || 'ERROR',
                message: action.payload.message || 'ERROR MESSAGE'
            }

        case util.LOAD_SUCCESS:
			let tmp_state = { ...state }
			tmp_state.loaded[action.payload.type][action.payload.file] = action.payload.data
			return tmp_state

        case util.INFO_FAILURE:
		case util.LOAD_FAILURE:
            return {
                ...state,
                site_title: 'ERROR',
               error:  action.payload.valid_msg || action.payload.error || 'ERROR'
            }

        default:
            return state
    }
}
