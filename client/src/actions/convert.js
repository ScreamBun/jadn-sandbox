import { RSAA } from 'redux-api-middleware'

const str_fmt = require('string-format')

// General Actions

// API Base URL
const baseAPI = '/api/convert'


// Helper Functions

// API Calls
// GET - /api/convert/ - convert basic info
const INFO_REQUEST = '@@convert/INFO_REQUEST'
export const INFO_SUCCESS = '@@convert/INFO_SUCCESS'
export const INFO_FAILURE = '@@convert/INFO_FAILURE'
export const info = () => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/', {base: baseAPI}),
        method: 'GET',
        types: [
            INFO_REQUEST, INFO_SUCCESS, INFO_FAILURE
        ]
    }
})

// POST - /api/convert/ - convert the given schema to a different format
const CONVERT_REQUEST = '@@convert/CONVERT_REQUEST'
export const CONVERT_SUCCESS = '@@convert/CONVERT_SUCCESS'
export const CONVERT_FAILURE = '@@convert/CONVERT_FAILURE'
export const convertSchema = (s, t, c) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/', {base: baseAPI}),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            schema: s,
            'convert-to': t,
            comments: c
        }),
        types: [
            CONVERT_REQUEST, CONVERT_SUCCESS, CONVERT_FAILURE
        ]
    }
})
