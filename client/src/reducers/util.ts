import { SchemaJADN } from 'components/create/schema/interface';
import * as util from '../actions/util';

export interface UtilState {
  site_title: string;
  site_desc: string;
  error: string;
  loaded: {
    messages: Record<string, any>;
    schemas: Record<string, any>;
  },
  selectedSchema: SchemaJADN;
  types: {
    base: Array<string>;
    schema: Array<string>;
  }
}

const initialState: UtilState = {
  site_title: 'JADN Sandbox',
  site_desc: '',
  error: '',
  loaded: {
    messages: {},
    schemas: []
  },
  selectedSchema: {
    types: []
  },
  types: {
    base: ['Binary', 'Boolean', 'Integer', 'Number', 'String', 'Enumerated', 'Choice', 'Array', 'ArrayOf', 'Map', 'MapOf', 'Record'],
    schema: []
  }
};

export default (state = initialState, action: util.UtilActions) => {
  const tmpState: UtilState = { ...state };

  switch (action.type) {
    case util.INFO_SUCCESS:
      return {
        ...state,
        site_title: action.payload.title,
        site_desc: action.payload.message,
        loaded: {
          ...state.loaded,
          messages: action.payload.messages,
          schemas: action.payload.schemas
        }
      };

    case util.LOAD_SUCCESS:
      tmpState.loaded[action.payload.type][action.payload.name] = action.payload.data;
      return tmpState;

    case util.SCHEMA_SUCCESS:
      return {
        ...state,
        selectedSchema: action.payload.schema || {},
        types: {
          ...state.types,
          schema: action.payload.schema.types.map(t => ({ [t[0]]: t })).reduce((prev, curr) => Object.assign(prev, curr), {})
        }
      };

    case util.INFO_FAILURE:
    case util.LOAD_FAILURE:
    case util.SCHEMA_FAILURE:
      return {
        ...state,
        error: action.payload.valid_msg || action.payload.error || 'ERROR'
      };

    default:
      return state;
  }
};

//selectors
export const getPageTitle = (state: { Util: { site_title: any; }; }) => state.Util.site_title;
export const getAllSchemas = (state: { Util: { loaded: { schemas: any; }; }; }) => state.Util.loaded.schemas;
export const getMsgFiles = (state: { Util: { loaded: { messages: any; }; }; }) => state.Util.loaded.messages;
export const getSelectedSchema = (state: { Util: { selectedSchema: any; }; }) => state.Util.selectedSchema;