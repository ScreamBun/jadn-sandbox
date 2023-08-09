import * as save from '../actions/save';

export interface SaveState {
    file_status: string;
    error: Array<Record<string, any>>;
}

const initialState: SaveState = {
    file_status: '',
    error: []
};

export default (state = initialState, action: save.SaveActions) => {
    switch (action.type) {
        case save.DELETE_SUCCESS:
        case save.SAVE_SUCCESS:
            return {
                ...state,
                file_save_status: action.payload.file_status
            };

        case save.DELETE_FAILURE:
        case save.SAVE_FAILURE:
            return {
                ...state,
                error: action.payload.error || 'ERROR'
            };

        default:
            return state;
    }
};