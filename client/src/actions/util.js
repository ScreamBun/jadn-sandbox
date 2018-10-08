import { RSAA } from 'redux-api-middleware';;
export const INFO_REQUEST = '@@util/INFO_REQUEST';
export const INFO_SUCCESS = '@@util/INFO_SUCCESS';
export const INFO_FAILURE = '@@util/INFO_FAILURE';

export const LOAD_REQUEST = '@@util/LOAD_REQUEST';
export const LOAD_SUCCESS = '@@util/LOAD_SUCCESS';
export const LOAD_FAILURE = '@@util/LOAD_FAILURE';

// Helper Functions

// API Calls
export const info = () => ({
    [RSAA]: {
        endpoint: '/api/',
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
