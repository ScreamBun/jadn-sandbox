import { RSAA } from 'redux-api-middleware';

const str_fmt = require('string-format')

// General Actions


// API Base URL
const baseAPI = '/api'

// Helper Functions
// OPTIONS - set schema locally for generating messages
export const SCHEMA_DEFINE = '@@generate/SCHEMA_DEFINE'
export const SCHEMA_SUCCESS = '@@generate/SCHEMA_SUCCESS'
export const SCHEMA_FAILURE = '@@generate/SCHEMA_FAILURE'
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
// GET - /api/create/ - get basic create info
const INFO_REQUEST = '@@generate/INFO_REQUEST'
export const INFO_SUCCESS = '@@generate/INFO_SUCCESS'
export const INFO_FAILURE = '@@generate/INFO_FAILURE'
export const info = () => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/create', {base: baseAPI}),
        method: 'GET',
        types: [
            INFO_REQUEST, INFO_SUCCESS, INFO_FAILURE
        ]
    }
})
