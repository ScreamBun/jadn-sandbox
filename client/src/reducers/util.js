import jwtDecode from 'jwt-decode'
import * as util from '../actions/util'

const initialState = {
    site_title: '',
    message: ''
}

export default (state=initialState, action=null) => {
    switch(action.type) {
        case util.INFO_SUCCESS:
            return {
                site_title: action.payload.title || 'ERROR',
                message: action.payload.message || 'ERROR MESSAGE'
            }

        case util.INFO_FAILURE:
            return {
                site_title: 'ERROR'
            }

        default:
            return state
    }
}
