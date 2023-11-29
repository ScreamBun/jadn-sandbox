import * as convert from '../actions/convert';

export interface ConvertState {
  valid_conversions: {
    schema_conversions: string[],
    conversions: Record<string, any>;
    translations: Record<string, any>;
    visualizations: Record<string, any>;
  };
  converted: {
    convert: string;
    fmt: string;
    fmt_ext: string;
    err: boolean;
  }
}

const initialState: ConvertState = {
  valid_conversions: {
    schema_conversions: [],
    conversions: {},
    translations: {},
    visualizations: {}
  },
  converted: {
    convert: '',
    fmt: '',
    fmt_ext: '',
    err: false
  },
};

export default (state = initialState, action: convert.ConvertActions) => {
  switch (action.type) {
    case convert.INFO_SUCCESS:
      return {
        ...state,
        valid_conversions: {
          schema_conversions: action.payload.schema_conversions || [],
          conversions: action.payload.conversions || {},
          translations: action.payload.translations || {},
          visualizations: action.payload.visualizations || {}
        }
      };

    case convert.CONVERT_SUCCESS:
      return {
        ...state,
        converted: action.payload.schema || {}
      };

    case convert.INFO_FAILURE:
    case convert.CONVERT_FAILURE:
      return {
        ...state,
        error: action.payload.error || 'ERROR'
      };

    default:
      return state;
  }
};

//selectors
export const getValidTranslations = (state: { Convert: { valid_conversions: { translations: any; }; }; }) => state.Convert.valid_conversions.translations;
export const getValidVisualizations = (state: { Convert: { valid_conversions: { visualizations: any; }; }; }) => state.Convert.valid_conversions.visualizations;
export const getSchemaConversions = (state: { Convert: { valid_conversions: { schema_conversions: any; }; }; }) => state.Convert.valid_conversions.schema_conversions;
