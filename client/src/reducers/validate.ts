import * as validate from '../actions/validate';

export interface ValidateState {
	messages: Record<string, any>;
	schemas: Array<any>;
	error: Record<string, any>;
	valid: {
		message: Record<string, any>;
		schema: Record<string, any>;
	}
}

const initialState: ValidateState = {
	messages: {},
	schemas: [],
	error: {},
	valid: {
		message: {},
		schema: {}
	}
};

export default (state = initialState, action: validate.ValidateActions) => {
	switch (action.type) {
		case validate.INFO_SUCCESS:
			return {
				...state,
				messages: action.payload.messages || {},
				schemas: action.payload.schemas || [],
				error: {}
			};

		case validate.VALIDATE_SCHEMA_SUCCESS:
			return {
				...state,
				valid: {
					...state.valid,
					schema: action.payload
				}
			};

		case validate.VALIDATE_MESSAGE_SUCCESS:
			return {
				...state,
				valid: {
					...state.valid,
					message: action.payload
				}
			};

		case validate.INFO_FAILURE:
		case validate.VALIDATE_FAILURE:
			console.log(action.payload);
			return {
				...state,
				error: action.payload.valid_msg || action.payload.error || 'ERROR'
			};

		default:
			return state;
	}
};
