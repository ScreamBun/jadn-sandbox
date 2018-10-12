import * as util from '../actions/util'

const initialState = {
    site_title: 'JADN Lint',
    site_desc: '',
    error: '',
    loaded: {
		messages: {},
		schemas: {}
	}
}

export default (state=initialState, action=null) => {
	let tmp_state = { ...state }

    switch(action.type) {
        case util.INFO_SUCCESS:
            return {
                ...state,
                site_title: action.payload.title || 'JADN Lint',
                site_desc: action.payload.message || 'JADN Schema Lint'
            }

        case util.LOAD_SUCCESS:
			tmp_state.loaded[action.payload.type][action.payload.file] = action.payload.data
			return tmp_state

        case util.INFO_FAILURE:
		case util.LOAD_FAILURE:
            return {
                ...state,
                error:  action.payload.valid_msg || action.payload.error || 'ERROR'
            }

        default:
            return state
    }
}
