import * as validate from '../actions/validate';

export interface ValidateState {
	error: Record<string, any>;
	valid: {
		message: Record<string, any>;
		schema: Record<string, any>;
	}
}

const initialState: ValidateState = {
	error: {},
	valid: {
		message: {},
		schema: {}
	}
};

export default (state = initialState, action: validate.ValidateActions) => {
	switch (action.type) {
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

		case validate.VALIDATE_FAILURE:
			return {
				...state,
				error: action.payload.error || action.payload.valid_msg || 'ERROR'
			};

		default:
			return state;
	}
};