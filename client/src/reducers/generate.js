import * as generator from '../actions/generate'

const initialState = {
    selectedSchema: {},
    schemas: [],
    message: {},
    types: {
        schema: ['Record', 'Enumerated', 'Map', 'Choice', 'ArrayOf', 'Array'],
		base: ['String']
    }
}

export default (state=initialState, action=null) => {
    let tmpMsg = {...state.message} || {}

    switch(action.type) {
        case generator.INFO_SUCCESS:
            return {
                ...state,
                schemas: action.payload.schemas || []
            }

        case generator.SCHEMA_DEFINE:
            return {
                ...state,
                selectedSchema: action.payload.schema
            }

        case generator.INFO_FAILURE:
        case generator.SCHEMA_FAILURE:
            return state

        default:
            return state
    }
}
