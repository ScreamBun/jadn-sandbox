import { RSAA } from 'redux-api-middleware';;

export const INFO_REQUEST = '@@convert/INFO_REQUEST';
export const INFO_SUCCESS = '@@convert/INFO_SUCCESS';
export const INFO_FAILURE = '@@convert/INFO_FAILURE';

export const CONVERT_REQUEST = '@@convert/CONVERT_REQUEST';
export const CONVERT_SUCCESS = '@@convert/CONVERT_SUCCESS';
export const CONVERT_FAILURE = '@@convert/CONVERT_FAILURE';

// Helper Functions

// API Calls
export const info = () => ({
    [RSAA]: {
        endpoint: '/api/convert',
        method: 'GET',
        types: [
            INFO_REQUEST, INFO_SUCCESS, INFO_FAILURE
        ]
    }
})


export const convertSchema = (s, t) => ({
    [RSAA]: {
        endpoint: '/api/convert',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            schema: s,
            'convert-to': t
        }),
        types: [
            CONVERT_REQUEST, CONVERT_SUCCESS, CONVERT_FAILURE
        ]
    }
})
