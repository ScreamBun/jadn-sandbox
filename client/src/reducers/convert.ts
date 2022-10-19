import * as convert from '../actions/convert';

export interface ConvertState {
  conversions: Record<string, any>;
  converted: {
    convert: string;
    fmt: string;
  }
  schemas: Array<any>;
}

const initialState: ConvertState = {
  conversions: {},
  converted: {
    convert: '',
    fmt: ''
  },
  schemas: []
};

export default (state=initialState, action: convert.ConvertActions) => {
  switch (action.type) {
    case convert.INFO_SUCCESS:
      return {
        ...state,
        conversions: action.payload.conversions || {},
        schemas: action.payload.schemas || []
      };

    case convert.CONVERT_SUCCESS:
      return {
        ...state,
        converted: action.payload.schema || {}
      };

    case convert.INFO_FAILURE:
    case convert.CONVERT_FAILURE:
		  console.log(action.payload);
      return {
        ...state,
        error: action.payload.error || 'ERROR'
      };

    default:
      return state;
  }
};