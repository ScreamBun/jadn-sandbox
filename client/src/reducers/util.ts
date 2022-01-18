import * as util from '../actions/util';

export interface UtilState {
  site_title: string;
  site_desc: string;
  error: string;
  loaded: {
	  messages: Record<string, any>;
	  schemas: Record<string, any>;
	}
}

const initialState: UtilState = {
  site_title: 'JADN Lint',
  site_desc: '',
  error: '',
  loaded: {
		messages: {},
		schemas: {}
	}
};

export default (state=initialState, action: util.UtilActions) => {
	const tmpState: UtilState = { ...state };

  switch (action.type) {
    case util.INFO_SUCCESS:
      return {
        ...state,
        site_title: action.payload.title || 'JADN Lint',
        site_desc: action.payload.message || 'JADN Schema Lint'
      };

    case util.LOAD_SUCCESS:
		  tmpState.loaded[action.payload.type][action.payload.file] = action.payload.data;
		  return tmpState;

    case util.INFO_FAILURE:
		  case util.LOAD_FAILURE:
        return {
          ...state,
          error:  action.payload.valid_msg || action.payload.error || 'ERROR'
        };

    default:
      return state;
  }
};
