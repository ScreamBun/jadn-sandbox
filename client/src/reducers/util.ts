import { SchemaJADN } from 'components/create/schema/interface';
import * as util from '../actions/util';
import { Option } from 'components/common/SBSelect'
import { exampleToSchemaMappings } from 'components/utils/constants';

export interface UtilState {
  site_title: string;
  site_desc: string;
  version_info: string;
  error: string;
  valid_msg_types: string[];
  loaded: {
    messages: {
      examples: Array<Option | string>;
      custom?: Array<Option | string>;
    };
    schemas: {
      examples: Array<string>;
      custom?: Array<string>;
    };
  },
  selectedSchema: SchemaJADN | object;
  selectedFile: Option | null;
  schemaIsValid: boolean;
  types: {
    base: Array<string>;
    schema: Array<string>;
    primitive: Array<string>;
  }
}

const initialState: UtilState = {
  site_title: 'JADN Sandbox',
  site_desc: '',
  version_info: '',
  error: '',
  valid_msg_types: [],
  loaded: {
    messages: {
      examples: [],
      custom: []
    },
    schemas: {
      examples: [],
      custom: []
    }
  },
  selectedSchema: {},
  selectedFile: null,
  schemaIsValid: false,
  types: {
    base: ['Array', 'ArrayOf', 'Binary', 'Boolean', 'Choice', 'Enumerated', 'Integer', 'Map', 'MapOf', 'Number', 'Record', 'String'],
    schema: [],
    primitive: ['Binary', 'Boolean', 'Integer', 'Number', 'String']
  }
};

export default (state = initialState, action: util.UtilActions) => {
  switch (action.type) {
    case util.INFO_SUCCESS:
      const examples = action.payload.schemas.examples || [];
      const filteredExamples = examples.filter(e => e !== "start-up-template.jadn");
      const sortedExamples = ["start-up-template.jadn", ...filteredExamples];
      return {
        ...state,
        site_title: action.payload.title,
        site_desc: action.payload.message,
        version_info: action.payload.version_info,
        valid_msg_types: action.payload.valid_msg_types,
        loaded: {
          ...state.loaded,
          messages: action.payload.messages,
          schemas: { ...action.payload.schemas, examples: sortedExamples }
        }
      };

    case util.LOAD_SUCCESS:
      if (action.payload.type === 'schemas') {
        const schemaFilename = action.payload.data?.filename ?? action.payload.name;
        const mappedMessages = schemaFilename && Object.prototype.hasOwnProperty.call(exampleToSchemaMappings, schemaFilename)
          ? exampleToSchemaMappings[schemaFilename as keyof typeof exampleToSchemaMappings]
          : undefined;

        let reorderedMessages = state.loaded.messages;

        if (mappedMessages && Array.isArray(state.loaded.messages.examples)) {
          const exampleMessages = state.loaded.messages.examples;
          const pickId = (msg: any) =>
            typeof msg === 'string' ? msg : msg?.value ?? msg?.filename ?? null;

          const prioritized: typeof exampleMessages = [];
          const remaining: typeof exampleMessages = [];

          exampleMessages.forEach(msg => {
            const id = pickId(msg);
            if (id && mappedMessages.includes(id)) {
              prioritized.push(msg);
            } else {
              remaining.push(msg);
            }
          });

          if (prioritized.length > 0) {
            reorderedMessages = {
              ...state.loaded.messages,
              examples: [...prioritized, ...remaining]
            };
          }
        }

        return {
          ...state,
          selectedSchema: action.payload.data,
          loaded: {
            ...state.loaded,
            messages: reorderedMessages || state.loaded.messages,
            schemas: state.loaded.schemas
          }
        };
      } else {
        return state;
      }

    case util.SCHEMA_SUCCESS:
      return {
        ...state,
        selectedSchema: action.payload.schema || {},
        types: {
          ...state.types,
          schema: action.payload.schema && action.payload.schema.types ? action.payload.schema.types.map(t => ({ [t[0]]: t })).reduce((prev, curr) => Object.assign(prev, curr), {}) : []
        }
      };

    case util.SET_SCHEMA_VALID:
      return {
        ...state,
        schemaIsValid: 'valid' in action.payload ? action.payload.valid : state.schemaIsValid
      };
    
    case util.FILE_SUCCESS:
      return {
        ...state,
        selectedFile: action.payload.file || null
      };

    case util.INFO_FAILURE:
    case util.LOAD_FAILURE:
    case util.SCHEMA_FAILURE:
    case util.FILE_FAILURE:
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
export const getValidMsgTypes = (state: { Util: { valid_msg_types: any; }; }) => state.Util.valid_msg_types;
export const getAllSchemas = (state: { Util: { loaded: { schemas: any; }; }; }) => state.Util.loaded.schemas;
export const getMsgFiles = (state: { Util: { loaded: { messages: any; }; }; }) => state.Util.loaded.messages;
export const getAllSchemasList = (state: { Util: { loaded: { schemas: { examples: any; custom: any; }; }; }; }) => {
  if (state.Util.loaded.schemas.custom == undefined) {
    return ([...state.Util.loaded.schemas.examples]);
  } else {
    return ([...state.Util.loaded.schemas.examples, ...state.Util.loaded.schemas.custom]);
  }
}
export const getSelectedSchema = (state: { Util: { selectedSchema: any; }; }) => state.Util.selectedSchema;
export const getSelectedFile = (state: { Util: { selectedFile: any; }; }) => state.Util.selectedFile;
export const isSchemaValid = (state: { Util: { schemaIsValid: any; }; }) => state.Util.schemaIsValid;