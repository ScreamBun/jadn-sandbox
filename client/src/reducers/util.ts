import { SchemaJADN } from 'components/create/schema/interface';
import * as util from '../actions/util';

export interface UtilState {
  site_title: string;
  site_desc: string;
  version_info: string;
  error: string;
  loaded: {
    messages: {
      testers: Record<string, any>;
      custom?: Record<string, any>;
    };
    schemas: {
      testers: Record<string, any>;
      custom?: Record<string, any>;
    };
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
  version_info: '',
  error: '',
  loaded: {
    messages: {
      testers: [],
      custom: []
    },
    schemas: {
      testers: [],
      custom: []
    }
  },
  selectedSchema: {
    types: []
  },
  types: {
    base: ['Array', 'ArrayOf', 'Binary', 'Boolean', 'Choice', 'Enumerated', 'Integer', 'Map', 'MapOf', 'Number', 'Record', 'String'],
    schema: []
  }
};

export default (state = initialState, action: util.UtilActions) => {
  switch (action.type) {
    case util.INFO_SUCCESS:
      return {
        ...state,
        site_title: action.payload.title,
        site_desc: action.payload.message,
        version_info: action.payload.version_info,
        loaded: {
          ...state.loaded,
          messages: action.payload.messages,
          schemas: action.payload.schemas
        }
      };

    case util.LOAD_SUCCESS:
      return {
        ...state,
        selectedSchema: action.payload.data
      }

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
export const getAllSchemasList = (state: { Util: { loaded: { schemas: { testers: any; custom: any; }; }; }; }) => [...state.Util.loaded.schemas.testers, ...state.Util.loaded.schemas.custom]