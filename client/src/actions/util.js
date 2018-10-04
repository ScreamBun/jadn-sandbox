import { RSAA } from 'redux-api-middleware';;
export const INFO_REQUEST = '@@util/INFO_REQUEST';
export const INFO_SUCCESS = '@@util/INFO_SUCCESS';
export const INFO_FAILURE = '@@util/INFO_FAILURE';

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