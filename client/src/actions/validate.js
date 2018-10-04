import { RSAA } from 'redux-api-middleware';;

export const INFO_REQUEST = '@@validate/INFO_REQUEST';
export const INFO_SUCCESS = '@@validate/INFO_SUCCESS';
export const INFO_FAILURE = '@@validate/INFO_FAILURE';

export const LOAD_REQUEST = '@@validate/LOAD_REQUEST';
export const LOAD_SUCCESS = '@@validate/LOAD_SUCCESS';
export const LOAD_FAILURE = '@@validate/LOAD_FAILURE';

export const VALIDATE_REQUEST = '@@validate/VALIDATE_REQUEST';
export const VALIDATE_SUCCESS = '@@validate/VALIDATED_SUCCESS';
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

export const load = (t, f) => ({
    [RSAA]: {
        endpoint: '/api/load/' + t + '/' + f,
        method: 'GET',
        types: [
            LOAD_REQUEST, LOAD_SUCCESS, LOAD_FAILURE
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
            VALIDATE_REQUEST, VALIDATE_SUCCESS, VALIDATE_FAILURE
        ]
    }
})