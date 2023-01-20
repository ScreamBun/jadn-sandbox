import { LocationChangeAction } from 'connected-react-router';
import * as Convert from './convert';
import * as Validate from './validate';
import * as Interface from './interfaces';
import * as Util from './util';


export type DispatchAction = (
    // Pre API Call
    Interface.MinimalAction |
    // Post API Call
    Convert.ConvertActions | Validate.ValidateActions | Util.UtilActions |
    // Router Specific
    LocationChangeAction
);

export {
    // Interfaces
    Interface,
    // Actions
    Convert as ConvertActions,
    Validate as ValidateActions,
    Util as UtilActions
};