import { RSAA } from 'redux-api-middleware'

const str_fmt = require('string-format')

// General Actions
export const VALIDATE_FAILURE = '@@validate/VALIDATE_FAILURE'

// API Base URL
const baseAPI = '/api/validate'

// Helper Functions

// API Calls
// GET - /api/validate/ - get basic validate info
const INFO_REQUEST = '@@validate/INFO_REQUEST'
export const INFO_SUCCESS = '@@validate/INFO_SUCCESS'
export const INFO_FAILURE = '@@validate/INFO_FAILURE'
export const info = () => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/', {base: baseAPI}),
        method: 'GET',
        types: [
            INFO_REQUEST, INFO_SUCCESS, INFO_FAILURE
        ]
    }
})

// POST - /api/validate/schema - validate the given schema
const VALIDATE_SCHEMA_REQUEST = '@@validate/VALIDATE_SCHEMA_REQUEST'
export const VALIDATE_SCHEMA_SUCCESS = '@@validate/VALIDATE_SCHEMA_SUCCESS'
export const validateSchema = (s) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/schema', {base: baseAPI}),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            schema: s
        }),
        types: [
            VALIDATE_SCHEMA_REQUEST, VALIDATE_SCHEMA_SUCCESS, VALIDATE_FAILURE
        ]
    }
})

// POST - /api/validate - validate teh given message against the given schema
const VALIDATE_MESSAGE_REQUEST = '@@validate/VALIDATE_MESSAGE_REQUEST'
export const VALIDATE_MESSAGE_SUCCESS = '@@validate/VALIDATE_MESSAGE_SUCCESS'
export const validateMessage = (s, m ,f, d) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/', {base: baseAPI}),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            schema: s,
            message: m,
            'message-format': f,
            'message-decode': d
        }),
        types: [
            VALIDATE_MESSAGE_REQUEST, VALIDATE_MESSAGE_SUCCESS, VALIDATE_FAILURE
        ]
    }
})