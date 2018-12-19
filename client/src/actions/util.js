import { RSAA } from 'redux-api-middleware'

const str_fmt = require('string-format')

// General Actions

// API Base URL
const baseAPI = '/api'


// Helper Functions

// API Calls
// GET /api/ - basic server info
const INFO_REQUEST = '@@util/INFO_REQUEST'
export const INFO_SUCCESS = '@@util/INFO_SUCCESS'
export const INFO_FAILURE = '@@util/INFO_FAILURE'
export const info = () => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/', {base: baseAPI}),
        method: 'GET',
        types: [
            INFO_REQUEST, INFO_SUCCESS, INFO_FAILURE
        ]
    }
})

// GET - /api/load/{TYPE}/{FILE} - load a file from the server
const LOAD_REQUEST = '@@util/LOAD_REQUEST'
export const LOAD_SUCCESS = '@@util/LOAD_SUCCESS'
export const LOAD_FAILURE = '@@util/LOAD_FAILURE'
export const load = (t, f) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/load/{type}/{file}', {base: baseAPI, type: t, file: f}),
        method: 'GET',
        types: [
            LOAD_REQUEST, LOAD_SUCCESS, LOAD_FAILURE
        ]
    }
})