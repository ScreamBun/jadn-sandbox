import * as generator from '../actions/generator'

const initialState = {
    schema: {},
    message: {},
    types: {
        schema: ['Record', 'Enumerated', 'Map', 'Choice', 'ArrayOf', 'Array'],
		base: ['String']
    }
}

export default (state=initialState, action=null) => {
    let tmpMsg = {...state.message} || {}

    switch(action.type) {
        case generator.SCHEMA_DEFINE:
            return {
                ...state,
                schema: action.payload.schema
            }

        case generator.SCHEMA_FAILURE:
            return state

        default:
            return state
    }
}
