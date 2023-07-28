import * as load from '../actions/load';

export interface LoadState {
    file_upload_status: string;
    error: Array<Record<string, any>>;
}

const initialState: LoadState = {
    file_upload_status: '',
    error: []
};

export default (state = initialState, action: load.LoadActions) => {
    switch (action.type) {
        case load.LOAD_SUCCESS:
            return {
                ...state,
                file_upload_status: action.payload.file_upload_status
            };

        case load.LOAD_FAILURE:
            return {
                ...state,
                error: action.payload.error || 'ERROR'
            };

        default:
            return state;
    }
};