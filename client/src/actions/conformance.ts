// API Base URL
import {ActionFailureResult, ActionRequestResult, ActionSuccessResult} from "./interfaces";

const baseAPI = '/api';

// API Calls
// GET - /api/conformance.ts/ - get basic create info
import {createAction} from "redux-api-middleware";

const GET_CONFORMANCE_TESTS_REQUEST = '@@generate/GET_CONFORMANCE_TESTS_REQUEST';
export const GET_CONFORMANCE_TESTS_SUCCESS = '@@generate/GET_CONFORMANCE_TESTS_SUCCESS';
export const GET_CONFORMANCE_TESTS_FAILURE = '@@generate/GET_CONFORMANCE_TESTS_FAILURE';
export const getConformanceTests = () => createAction({
    endpoint: `${baseAPI}/conformance`,
    method: 'GET',
    types: [
        GET_CONFORMANCE_TESTS_REQUEST,
        GET_CONFORMANCE_TESTS_SUCCESS,
        GET_CONFORMANCE_TESTS_FAILURE
    ]
});

export interface InfoSuccessAction extends ActionSuccessResult {
    type: typeof GET_CONFORMANCE_TESTS_SUCCESS;
    payload: {
        profile_tests: { };
    };
}

// Request Actions
export interface GenerateRequestActions extends ActionRequestResult {
    type: typeof GET_CONFORMANCE_TESTS_REQUEST;
}

// Failure Actions
export interface GenerateFailureActions extends ActionFailureResult {
    type: typeof GET_CONFORMANCE_TESTS_FAILURE;
}

export type GenerateActions = (
    GenerateRequestActions | GenerateFailureActions |
    // Success Actions
    InfoSuccessAction
);