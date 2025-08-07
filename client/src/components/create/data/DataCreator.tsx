import React from 'react'
import { getSelectedSchema } from 'reducers/util'
import { useSelector } from 'react-redux'
import { AllFieldArray } from '../schema/interface'
import Field from 'components/create/data/lib/field/Field'
import SBEditor from 'components/common/SBEditor'
import SBScrollToTop from 'components/common/SBScrollToTop'
import SBSelect, { Option } from 'components/common/SBSelect'
import SBSaveFile from 'components/common/SBSaveFile'
import SBCopyToClipboard from 'components/common/SBCopyToClipboard'
import SBDownloadBtn from 'components/common/SBDownloadBtn'
import { LANG_JSON } from 'components/utils/constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExpand, faUndo } from '@fortawesome/free-solid-svg-icons'
import { useDispatch } from 'react-redux'
import { validateMessage } from 'actions/validate'
import { sbToastError, sbToastSuccess } from 'components/common/SBToast'

const DataCreator = (props: any) => {
    const dispatch = useDispatch();
    // Destructure props
    const { generatedMessage, setGeneratedMessage, selection, setSelection } = props;

    // Field Change Handler
    const fieldChange = (k: string, v: any) => {
        setGeneratedMessage((prev: any) => {
            const updated = { ...prev };
            if (v === "" || v === undefined || v === null) {
                delete updated[k];
            } else {
                updated[k] = v;
            }
            return updated;
        });
    };

    // Get the selected schema & selected roots/types
    const schemaObj = useSelector(getSelectedSchema);
    const roots = schemaObj.meta ? schemaObj.meta && schemaObj.meta.roots : [];
    const types = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === selection?.value) : [];

    // Handle user dropdown selection
    const handleSelection = (e: Option) => {
        setSelection(e);
        setGeneratedMessage({});
    }

    const handleValidate = async () => {
        if (!schemaObj || !generatedMessage) {
            sbToastError('ERROR: Validation failed - Please select schema and enter data');
            return;
        }
        try {
            const type = selection?.value || '';
            const newMsg = JSON.stringify(generatedMessage[type]);
            const action: any = await dispatch(validateMessage(schemaObj, newMsg, LANG_JSON, type));
            // Check if the action is a success or failure
            if (action.type === '@@validate/VALIDATE_MESSAGE_SUCCESS') {
                if (action.payload?.valid_bool) {
                    sbToastSuccess(action.payload.valid_msg);
                } else {
                    sbToastError(action.payload.valid_msg);
                }
            } else if (action.type === '@@validate/VALIDATE_FAILURE') {
                sbToastError(action.payload?.valid_msg || 'Validation failed');
            }
        } catch (err: any) {
            sbToastError(err.message || 'Validation error');
        }
    };

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelection(null);
        setGeneratedMessage({});
    }    

    const [dataFullScreen, setDataFullScreen] = React.useState(false);
    const [jsonFullScreen, setJsonFullScreen] = React.useState(false);

    // Decide which fields to display
    let fieldDefs: null | JSX.Element | JSX.Element[] = null;
    if (selection?.value) {
        fieldDefs = types.map((field: AllFieldArray, idx: number) => {
            return (
                <Field
                    key={idx}
                    field={field}
                    fieldChange={fieldChange}
                />
            );
        });
    }

    return (
        <div className='row'>
            {<div className={dataFullScreen ? 'col-md-12' : 'col-md-6'}
                style={{display: jsonFullScreen ? 'none' : 'block'}}>
                <div className='card'>
                    <div className = "card-header p-2 d-flex align-items-center">
                        <h5 className = "mb-0">Data Builder</h5>
                        <div className = "ms-auto">
                            <button type='reset' className='btn btn-sm btn-danger float-end ms-1' title='Reset Builder' onClick={onReset}>
                                <FontAwesomeIcon icon={faUndo} />
                            </button>
                            <button className='btn btn-sm btn-primary float-end ms-1' title='Full Screen Data' onClick={() => setDataFullScreen(!dataFullScreen)}>
                                <FontAwesomeIcon icon={faExpand} />
                            </button>
                        </div>
                    </div>
                    <div className = "card-header p-2 d-flex">
                        <SBSelect id={"command-list"}
                            data={roots}
                            onChange={handleSelection}
                            placeholder={'Select a root type...'}
                            value={selection}
                            isSmStyle
                            isClearable
                            customNoOptionMsg={"Schema is missing a root type"}
                        />
                    </div>                      
                    <div className='card-body p-2'>
                        <div id = "data-builder" className = 'card-body-page' >
                            {fieldDefs}
                        </div>
                        <SBScrollToTop divID = "data-builder" />
                    </div>
                </div>
            </div>}
            <div className={jsonFullScreen ? 'col-md-12' : 'col-md-6'}
                style={{display: dataFullScreen ? 'none' : 'block'}}>
                <div className='card'>
                    <div className="card-header p-2 d-flex align-items-center">
                        <h5 className="mb-0">JSON Viewer</h5>
                        <div className="ms-auto">
                            <button className='btn btn-sm btn-primary float-end ms-1' title='Full Screen JSON' onClick={() => setJsonFullScreen(!jsonFullScreen)}>
                                <FontAwesomeIcon icon={faExpand} />
                            </button>
                            <button type="button"
                                className="btn btn-sm btn-primary me-1"
                                onClick={handleValidate}
                                disabled = {selection && generatedMessage? false:true}
                            >
                                Validate
                            </button>
                            <SBSaveFile buttonId={'saveMessage'} toolTip={'Save Message'} data={generatedMessage} loc={'messages'} customClass={"float-end ms-1"} ext={LANG_JSON} />
                            <SBCopyToClipboard buttonId={'copyMessage'} data={generatedMessage} customClass='float-end' shouldStringify={true} />
                            <SBDownloadBtn buttonId='msgDownload' customClass='float-end me-1' data={JSON.stringify(generatedMessage, null, 2)} ext={LANG_JSON} />
                        </div>
                    </div>
                    <div className='card-body p-2'>
                        <SBEditor data={generatedMessage} isReadOnly={true}></SBEditor>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataCreator;