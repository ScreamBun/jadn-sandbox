import jwtDecode from 'jwt-decode'
import * as convert from '../actions/convert'

const initialState = {
    conversions: {},
    converted: {},
    schemas: []
}

export default (state=initialState, action=null) => {
    switch(action.type) {
        case convert.INFO_SUCCESS:
            return {
                ...state,
                conversions: action.payload.conversions || {},
                schemas: action.payload.schemas || []
            }

        case convert.CONVERT_SUCCESS:
            return {
                ...state,
                converted: action.payload.schema || {}
            }
			
        case convert.INFO_FAILURE:
        case convert.CONVERT_FAILURE:
		    console.log(action.payload)
            return {
                ...state,
                error: action.payload.error || 'ERROR'
            }

        default:
            return state
    }
}
