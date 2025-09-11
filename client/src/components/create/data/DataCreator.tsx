import React, { useState } from 'react'
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExpand, faUndo, faWandSparkles, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useDispatch } from 'react-redux'
import { validateMessage } from 'actions/validate'
import { sbToastError, sbToastSuccess } from 'components/common/SBToast'
import { validateField as _validateFieldAction, clearFieldValidation } from 'actions/validatefield';
import SBLoadBuilder from 'components/common/SBLoadBuilder'
import { destructureField } from './lib/utils'
import { LANG_XML, LANG_JSON } from 'components/utils/constants';
import { convertData } from "actions/convert";

const DataCreator = (props: any) => {
    const dispatch = useDispatch();
    // Destructure props
    const { generatedMessage, setGeneratedMessage, selection, setSelection, xml, setXml } = props;
    const [loadedFieldDefs, setLoadedFieldDefs] = useState<null | JSX.Element | JSX.Element[]>(null);
    const [loadVersion, setLoadVersion] = useState(0); // increment to force Field remounts on each builder load
    const [selectedSerialization, setSelectedSerialization] = useState<Option | null>({label:"JSON Viewer", value: LANG_JSON});

    // Field Change Handler
    const fieldChange = (k: string, v: any) => {
        setJsonValidated(false);
        setGeneratedMessage((prev: any) => {
            const updated = { ...prev };
            if (v === "" || v === undefined || v === null) {
                delete updated[k];
            } else {
                updated[k] = v;
            }
            convertToXML(updated);
            return updated;
        });
    };

    // Get the selected schema & selected roots/types
    const schemaObj = useSelector(getSelectedSchema);
    const roots = schemaObj.meta ? schemaObj.meta && schemaObj.meta.roots : [];
    const types = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === selection?.value) : [];

    // Handle root dropdown selection
    const handleSelection = (e: Option) => {
        setSelection(e);
        setGeneratedMessage({});
        dispatch({ type: 'TOGGLE_DEFAULTS', payload: false });
        setLoadedFieldDefs(null);
        setXml("");
    }

    // Handle full data validation
    const [jsonValidated, setJsonValidated] = useState(false);
    const handleValidate = async () => {
        if (!schemaObj || !generatedMessage) {
            sbToastError('ERROR: Validation failed - Please select schema and enter data');
            setJsonValidated(false);
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
                    setJsonValidated(true);
                } else {
                    sbToastError(action.payload.valid_msg);
                    setJsonValidated(false);
                }
            } else if (action.type === '@@validate/VALIDATE_FAILURE') {
                sbToastError(action.payload?.valid_msg || 'Validation failed');
                setJsonValidated(false);
            }
        } catch (err: any) {
            sbToastError(err.message || 'Validation error');
            setJsonValidated(false);
        }
    };

    // Handle reset of root
    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelection(null);
        setGeneratedMessage({});
        dispatch({ type: 'TOGGLE_DEFAULTS', payload: false });
        dispatch(clearFieldValidation());
        setLoadedFieldDefs(null);
        setXml("");
    }    

    const toggleDefaults = useSelector((state: any) => state.toggleDefaults);

    // Handle generate data
    const setDefaults = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (toggleDefaults) {
            dispatch({ type: 'TOGGLE_DEFAULTS', payload: false });
        } else {
            dispatch({ type: 'TOGGLE_DEFAULTS', payload: true });
        }
    }

    const [dataFullScreen, setDataFullScreen] = useState(false);
    const [jsonFullScreen, setJsonFullScreen] = useState(false);

    // Handle making sure loaded defs are reset
    React.useEffect(() => {
        if (loadedFieldDefs) {
            setLoadedFieldDefs(null);
        }
    }, [selection, schemaObj]);

    // Handle: convert generatedMessage to XML
    const convertToXML = (data: string) => {
        try {
            dispatch(convertData(JSON.stringify(data), LANG_JSON, LANG_XML))
                .then((rsp: any) => {
                    if(rsp.payload.data) {
                        if(rsp.payload.data.xml) {
                            setXml(rsp.payload.data.xml)
                        } 
                    } else {
                        console.log(rsp.payload.message);
                    }
                })
                .catch((submitErr: { message: string }) => {
                    sbToastError(submitErr.message)
                });
        } catch (err) {
            if (err instanceof Error) {
                sbToastError(err.message)
            }
        }        
    }

    // Decide which fields to display
    let fieldDefs: null | JSX.Element | JSX.Element[] = null;
    if (selection?.value) {
        fieldDefs = types.map((field: AllFieldArray, idx: number) => {
            const fieldKey = `${selection?.value || 'root'}-${loadVersion}-${idx}`;
            return (
                <Field
                    key={fieldKey}
                    field={field}
                    fieldChange={fieldChange}
                    toClear={false}
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
                        <h5 className = "mb-0 me-1">Data Builder</h5>
                        <SBSelect id={"command-list"}
                            data={roots}
                            onChange={handleSelection}
                            placeholder={'Select a root type...'}
                            value={selection}
                            isSmStyle
                            isClearable
                            customNoOptionMsg={"Schema is missing a root type"}
                        />
                        <div className = "ms-auto">
                            <SBLoadBuilder
                                customClass={`float-start ms-1 ${selection?.value ? '' : 'disabled'}`} 
                                onLoad={({root, fields, message}) => 
                                    {
                                        // Force reload of Field components
                                        setLoadVersion(v => v + 1);
                                        setLoadedFieldDefs(null);

                                        // Locate value of fields
                                        let restoredMsg: any = (message && typeof message === 'object') ? { ...message } : {};
                                        if (!message) {
                                            // reconstruct from saved field entries
                                            fields.forEach((f: any) => {
                                                if (f && f.field) {
                                                    const [_idx, _name] = destructureField(f.field);
                                                    if (_name) {
                                                        if (f.value !== undefined && f.value !== null && f.value !== "") {
                                                            restoredMsg[_name] = f.value;
                                                        } else {
                                                            // ensure cleared fields are removed
                                                            delete restoredMsg[_name];
                                                        }
                                                    }
                                                }
                                            });
                                        }

                                        const built = fields.map((f: any, idx: number) => {
                                            const [_idx, _name] = destructureField(f.field);
                                            return (
                                                <Field
                                                    key={`saved-${loadVersion}-${idx}`} // include loadVersion so reload forces remount
                                                    field={f.field}
                                                    fieldChange={fieldChange}
                                                    parent={f.parent || undefined}
                                                    value={restoredMsg[_name]}
                                                    toClear={false}
                                                />
                                            );
                                        });
                                        dispatch(clearFieldValidation());
                                        setLoadedFieldDefs(built);
                                        setGeneratedMessage(restoredMsg)
                                    }}
                                fieldDefs={loadedFieldDefs ? loadedFieldDefs : fieldDefs}
                                selection={selection}
                                generatedMessage={generatedMessage}
                            />
                            <button className={`btn btn-sm ${toggleDefaults ? 'btn-warning' : 'btn-primary'} float-start ms-1`} title='Generate Data' onClick={setDefaults}>
                                <FontAwesomeIcon icon = {faWandSparkles} />
                            </button>
                            <button className='btn btn-sm btn-primary ms-1' title='Full Screen Data' onClick={() => setDataFullScreen(!dataFullScreen)}>
                                <FontAwesomeIcon icon={faExpand} />
                            </button>
                            <button type='reset' className='btn btn-sm btn-danger-primary float-end ms-1' title='Reset Builder' onClick={onReset}>
                                <FontAwesomeIcon icon={faUndo} />
                            </button>
                        </div>
                    </div>                 
                    <div className='card-body p-2'>
                        <div id = "data-builder" className = 'card-body-page' >
                            {loadedFieldDefs ? loadedFieldDefs : fieldDefs}
                        </div>
                        <SBScrollToTop divID = "data-builder" />
                    </div>
                </div>
            </div>}
            <div className={jsonFullScreen ? 'col-md-12' : 'col-md-6'}
                style={{display: dataFullScreen ? 'none' : 'block'}}>
                <div className='card'>
                    <div className="card-header p-2 d-flex align-items-center">
                        <div className="col-md-3 me-2">
                            <SBSelect 
                                value={selectedSerialization}
                                onChange={setSelectedSerialization}
                                data={[
                                    { label: "JSON Viewer", value: LANG_JSON },
                                    { label: "XML Viewer", value: LANG_XML },
                                ]}
                                isSmStyle
                            />
                        </div>
                        <div className="ms-auto">
                            <button className='btn btn-sm btn-primary float-end ms-1' title='Full Screen JSON' onClick={() => setJsonFullScreen(!jsonFullScreen)}>
                                <FontAwesomeIcon icon={faExpand} />
                            </button>
                            {selectedSerialization?.value===LANG_JSON ? 
                            <>
                                <button type="button"
                                    className="btn btn-sm btn-primary me-1"
                                    onClick={handleValidate}
                                    disabled = {selection && generatedMessage? false:true}
                                >
                                    Valid
                                    {jsonValidated ? (
                                        <span className="badge rounded-pill text-bg-success ms-1">
                                            <FontAwesomeIcon icon={faCheck} />
                                        </span>) : (
                                        <span className="badge rounded-pill text-bg-danger ms-1">
                                            <FontAwesomeIcon icon={faXmark} />
                                        </span>)
                                    }
                                </button>
                                <SBSaveFile buttonId={'saveMessage'} toolTip={'Save Data'} data={generatedMessage} loc={'messages'} customClass={"float-end ms-1"} ext={LANG_JSON} />
                                <SBCopyToClipboard buttonId={'copyMessage'} data={generatedMessage} customClass='float-end' shouldStringify={true} />
                                <SBDownloadBtn buttonId='msgDownload' customClass='float-end me-1' data={JSON.stringify(generatedMessage, null, 2)} ext={LANG_JSON} />
                            </>
                            :
                            <></>
                            }
                        </div>
                    </div>
                    <div className='card-body p-2'>
                        {selectedSerialization?.value===LANG_JSON ? 
                        <SBEditor data={generatedMessage} isReadOnly={true}></SBEditor>
                        :
                        <SBEditor data={xml} isReadOnly={true} convertTo={LANG_XML}></SBEditor>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataCreator;