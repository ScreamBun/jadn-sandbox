import * as conformance from '../actions/conformance';

export interface ConformanceState {
  profile_tests: Array<any>;
}

const initialState: ConformanceState = {
  profile_tests: []
};

export default (state=initialState, action: conformance.GenerateActions) => {
  switch (action.type) {
    case conformance.GET_CONFORMANCE_TESTS_SUCCESS:
      return {
        ...state,
        profile_tests: action.payload.profile_tests || []
      };

    case conformance.GET_CONFORMANCE_TESTS_FAILURE:

    default:
      return state;
  }
};