import * as generator from '../actions/generate';

export interface GenerateState {
  selectedSchema: Record<string, any>;
  schemas: Array<any>;
  message: Record<string, any>;
  types: {
    schema: Array<string>;
	  base: Array<string>;
  }
}

const initialState: GenerateState = {
  selectedSchema: {},
  schemas: [],
  message: {},
  types: {
    schema: ['Record', 'Enumerated', 'Map', 'Choice', 'ArrayOf', 'Array'],
		base: ['String']
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
        selectedSchema: action.payload.schema
      };

    case generator.INFO_FAILURE:
    case generator.SCHEMA_FAILURE:
      return state;

    default:
      return state;
  }
};
