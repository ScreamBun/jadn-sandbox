import * as convert from '../actions/convert';

export interface ConvertState {
  conversions: Record<string, any>;
  converted: {
    convert: string;
    fmt: string;
    fmt_ext: string;
  }
}

const initialState: ConvertState = {
  conversions: {},
  converted: {
    convert: '',
    fmt: '',
    fmt_ext: ''
  },
};

export default (state = initialState, action: convert.ConvertActions) => {
  switch (action.type) {
    case convert.INFO_SUCCESS:
      return {
        ...state,
        conversions: action.payload.conversions || {}
      };

    case convert.CONVERT_SUCCESS:
    case convert.CONVERTTOALL_SUCCESS:
      return {
        ...state,
        converted: action.payload.schema || {}
      };

    case convert.INFO_FAILURE:
    case convert.CONVERT_FAILURE:
    case convert.CONVERTTOALL_FAILURE:
      return {
        ...state,
        error: action.payload.error || 'ERROR'
      };

    default:
      return state;
  }
};

//selectors
export const getConversions = (state: { Convert: { conversions: any; }; }) => state.Convert.conversions;