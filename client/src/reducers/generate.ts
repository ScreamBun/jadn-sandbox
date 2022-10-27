import * as generator from '../actions/generate';
import { SchemaJADN, TypeArray } from '../components/generate/schema/interface';

export interface GenerateState {
  selectedSchema: SchemaJADN;
  schemas: Array<string>;
  message: Record<string, any>;
  types: {
    base: Array<string>;
    schema: Record<string, TypeArray>;
  }
}

const initialState: GenerateState = {
  selectedSchema: {
    types: []
  },
  schemas: [],
  message: {},
  types: {
		base: ['Binary', 'Boolean', 'Integer', 'Number', 'Null', 'String', 'Enumerated', 'Choice', 'Array', 'ArrayOf', 'Map', 'MapOf', 'Record'],
    schema: {}
  }
};

export default (state=initialState, action: generator.GenerateActions) => {
  switch (action.type) {
    case generator.INFO_SUCCESS:
      return {
        ...state,
        schemas: action.payload.schemas || []
      };

    case generator.SCHEMA_SUCCESS:
      return {
        ...state,
        selectedSchema: action.payload.schema || {},
        types: {
          ...state.types,
          schema: action.payload.schema.types.map(t => ({ [t[0]]: t })).reduce((prev, curr) => Object.assign(prev, curr), {})
        }
      };

    case generator.INFO_FAILURE:
    case generator.SCHEMA_FAILURE:
      return state;

    default:
      return state;
  }
};
