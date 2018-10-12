import { RSAA } from 'redux-api-middleware';

export const INFO_REQUEST = '@@generate/INFO_REQUEST';
export const INFO_SUCCESS = '@@generate/INFO_SUCCESS';
export const INFO_FAILURE = '@@generate/INFO_FAILURE';

export const SCHEMA_DEFINE = '@@generate/SCHEMA_DEFINE';
export const SCHEMA_REQUEST = '@@generate/SCHEMA_REQUEST';
export const SCHEMA_SUCCESS = '@@generate/SCHEMA_SUCCESS';
export const SCHEMA_FAILURE = '@@generate/SCHEMA_FAILURE';

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
export const info = () => ({
    [RSAA]: {
        endpoint: '/api/create',
        method: 'GET',
        types: [
            INFO_REQUEST, INFO_SUCCESS, INFO_FAILURE
        ]
    }
})
