import * as generator from '../actions/generate';
import { SchemaJADN } from '../components/generate/schema/interface';

export interface GenerateState {
  selectedSchema: SchemaJADN;
  schemas: Array<string>;
  message: Record<string, any>;
  types: {
	  base: Array<string>;
    schema: Record<string, any>;
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

    case generator.SCHEMA_DEFINE:
      return {
        ...state,
        selectedSchema: action.payload.schema || {}
      };

    case generator.INFO_FAILURE:
    case generator.SCHEMA_FAILURE:
      return state;

    default:
      return state;
  }
};
