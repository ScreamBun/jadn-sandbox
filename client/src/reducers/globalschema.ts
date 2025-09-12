import { SchemaJADN } from 'components/create/schema/interface';
import * as globalschema from '../actions/globalschema';

export interface GlobalSchemaState {
    error: Record<string, any>;
    props: {file: string, schema: SchemaJADN};
}

const initialState: GlobalSchemaState = {
    error: {},
    props: {file: '', schema: {} as SchemaJADN},
};

export default (state = initialState, action: globalschema.GlobalSchemaActions) => {
    switch (action.type) {
        case globalschema.GLOBALSCHEMA_SUCCESS:
            return {
                ...state,
                props: action.payload,
            };

        case globalschema.GLOBALSCHEMA_CLEAR:
            return {
                ...state,
                props: {file: '', schema: {} as SchemaJADN},
            };

        case globalschema.GLOBALSCHEMA_FAILURE:
            return {
                ...state,
                error: action.payload.error || 'ERROR'
            };
        default:
            return state;
    }
};