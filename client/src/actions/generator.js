import { RSAA } from 'redux-api-middleware';;

export const SCHEMA_DEFINE = '@@cmd_gen/SCHEMA_DEFINE';
export const SCHEMA_REQUEST = '@@cmd_gen/SCHEMA_REQUEST';
export const SCHEMA_SUCCESS = '@@cmd_gen/SCHEMA_SUCCESS';
export const SCHEMA_FAILURE = '@@cmd_gen/SCHEMA_FAILURE';

// Helper Functions
export const setSchema = (schema) => ({
    [RSAA]: {
        endpoint: '',
        method: 'OPTIONS',
        types: [
            {
                type: SCHEMA_DEFINE,
                payload: (action, state) => ({ schema: schema })
            }, SCHEMA_SUCCESS, SCHEMA_FAILURE
        ]
    }
})

// API Calls
