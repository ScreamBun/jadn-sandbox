import { RSAA } from 'redux-api-middleware';;

export const INFO_REQUEST = '@@validate/INFO_REQUEST';
export const INFO_SUCCESS = '@@validate/INFO_SUCCESS';
export const INFO_FAILURE = '@@validate/INFO_FAILURE';

export const VALIDATE_SCHEMA_REQUEST = '@@validate/VALIDATE_SCHEMA_REQUEST';
export const VALIDATE_SCHEMA_SUCCESS = '@@validate/VALIDATE_SCHEMA_SUCCESS';

export const VALIDATE_MESSAGE_REQUEST = '@@validate/VALIDATE_MESSAGE_REQUEST';
export const VALIDATE_MESSAGE_SUCCESS = '@@validate/VALIDATE_MESSAGE_SUCCESS';

export const VALIDATE_FAILURE = '@@validate/VALIDATE_FAILURE';

// Helper Functions

// API Calls
export const info = () => ({
    [RSAA]: {
        endpoint: '/api/validate',
        method: 'GET',
        types: [
            INFO_REQUEST, INFO_SUCCESS, INFO_FAILURE
        ]
    }
})

export const validateSchema = (s) => ({
    [RSAA]: {
        endpoint: '/api/validate/schema',
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


export const validateMessage = (s, m ,f, d) => ({
    [RSAA]: {
        endpoint: '/api/validate',
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