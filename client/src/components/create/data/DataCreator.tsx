import React, { useEffect, useState } from 'react'
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
import { destructureField, removeXmlWrapper } from './lib/utils'
import { LANG_XML_UPPER, LANG_JSON_UPPER, LANG_CBOR_UPPER, LANG_ANNOTATED_HEX, COMPACT_CONST, CONCISE_CONST } from 'components/utils/constants';
import { convertData } from "actions/convert";
import { clearHighlight } from "actions/highlight";
import { getToggleGenData } from 'reducers/gendata'
import { setGeneratedData } from 'actions/util'
import SBCompactConciseBtn from 'components/common/SBCompactConciseBtn'

const DataCreator = (props: any) => {
    const dispatch = useDispatch();
    // Destructure props
    const { generatedMessage, setGeneratedMessage, selection, setSelection, xml, setXml, cbor, setCbor, annotatedCbor, setAnnotatedCbor, compactJson, setCompactJson, conciseJson, setConciseJson } = props;

    // States
    const [loadedFieldDefs, setLoadedFieldDefs] = useState<null | JSX.Element | JSX.Element[]>(null);
    const [loadVersion, setLoadVersion] = useState(0); // increment to force Field remounts on each builder load
    const [selectedSerialization, setSelectedSerialization] = useState<Option | null>({label:LANG_JSON_UPPER, value: LANG_JSON_UPPER});
    const [jsonValidated, setJsonValidated] = useState(false);
    const [xmlValidated, setXmlValidated] = useState(false);
    const [cborValidated, setCborValidated] = useState(false);
    const [dataFullScreen, setDataFullScreen] = useState(false);
    const [jsonFullScreen, setJsonFullScreen] = useState(false);
    const [toggleCompactBtn, setToggleCompactBtn] = useState('');
    const digestFormat = selectedSerialization?.value=== LANG_JSON_UPPER ?
                            (toggleCompactBtn == COMPACT_CONST ? compactJson : toggleCompactBtn == CONCISE_CONST ? conciseJson : generatedMessage) 
                            : selectedSerialization?.value===LANG_XML_UPPER ? xml : selectedSerialization?.value===LANG_CBOR_UPPER ? cbor : annotatedCbor
    // Redux states
    const toggleGenData = useSelector(getToggleGenData);
    const highlightedItems = useSelector((state: any) => state.Highlight.highlightWords);
    const schemaObj = useSelector(getSelectedSchema);

    // Get selected type
    const roots = schemaObj.meta ? schemaObj.meta && schemaObj.meta.roots : [];
    const types = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === selection?.value) : [];

    // Handle compact/concise button click
    const onCompactBtnClick = () => {
        if (toggleCompactBtn === '') {
            setToggleCompactBtn(COMPACT_CONST);
        } else if (toggleCompactBtn === COMPACT_CONST) {
            setToggleCompactBtn(CONCISE_CONST);
        } else if (toggleCompactBtn === CONCISE_CONST) {
            setToggleCompactBtn('');
        }
    }


    // Field Change Handler
    const fieldChange = (k: string, v: any) => {
        setToggleCompactBtn(''); // reset compact/concise on field change
        setJsonValidated(false);
        setXmlValidated(false);
        setCborValidated(false);
        setGeneratedMessage((prev: any) => {
            const updated = { ...prev };
            if (v === "" || v === undefined || v === null) {
                delete updated[k];
            } else {
                updated[k] = v;
            }
            convertJSON(updated)
            dispatch<any>(setGeneratedData(updated));
            return updated;
        });
    };

    // Handle root dropdown selection
    const handleSelection = (e: Option) => {
        setSelection(e);
        setGeneratedMessage({});
        dispatch<any>(setGeneratedData({}));
        dispatch({ type: 'TOGGLE_GEN_DATA', payload: false });
        setLoadedFieldDefs(null);
        setJsonValidated(false);
        setXmlValidated(false);
        setCborValidated(false);
        setXml("");
        setCbor("");
        setCompactJson('');
        setConciseJson('');
        setAnnotatedCbor("");
        dispatch<any>(clearHighlight());
    }

    // Handle full data validation
    const handleValidate = async (lang: string) => {
        if (!schemaObj || !generatedMessage) {
            sbToastError('ERROR: Validation failed - Please select schema and enter data');
            setJsonValidated(false);
            setXmlValidated(false);
            setCborValidated(false);
            return;
        }
        try {
            const type = selection?.value || '';
            const newMsg = lang === LANG_JSON_UPPER ? JSON.stringify(generatedMessage[type]) : lang === LANG_XML_UPPER ? removeXmlWrapper(xml) : cbor;
            const action: any = await dispatch(validateMessage(schemaObj, newMsg, lang, type));
            // Check if the action is a success or failure
            if (action.type === '@@validate/VALIDATE_MESSAGE_SUCCESS') {
                if (action.payload?.valid_bool) {
                    sbToastSuccess(action.payload.valid_msg);
                    if (lang === LANG_JSON_UPPER) setJsonValidated(true);
                    if (lang === LANG_XML_UPPER) setXmlValidated(true);
                    if (lang === LANG_CBOR_UPPER) setCborValidated(true);
                } else {
                    sbToastError(action.payload.valid_msg);
                    if (lang === LANG_JSON_UPPER) setJsonValidated(false);
                    if (lang === LANG_XML_UPPER) setXmlValidated(false);
                    if (lang === LANG_CBOR_UPPER) setCborValidated(false);
                }
            } else if (action.type === '@@validate/VALIDATE_FAILURE') {
                sbToastError(action.payload?.valid_msg || 'Validation failed');
                if (lang === LANG_JSON_UPPER) setJsonValidated(false);
                if (lang === LANG_XML_UPPER) setXmlValidated(false);
                if (lang === LANG_CBOR_UPPER) setCborValidated(false);
            }
        } catch (err: any) {
            sbToastError(err.message || 'Validation error');
            setJsonValidated(false);
            setXmlValidated(false);
        }
    };

    // Handle reset of root
    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelection(null);
        setGeneratedMessage({});
        dispatch<any>(setGeneratedData({}));
        dispatch({ type: 'TOGGLE_GEN_DATA', payload: false });
        dispatch(clearFieldValidation());
        setJsonValidated(false);
        setXmlValidated(false);
        setLoadedFieldDefs(null);
        setXml("");
        setCbor("");
        setCompactJson('');
        setConciseJson('');
        setAnnotatedCbor("");
        dispatch<any>(clearHighlight());
    }    

    // Handle generate data
    const setDefaults = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (toggleGenData) {
            dispatch({ type: 'TOGGLE_GEN_DATA', payload: false });
        } else {
            dispatch({ type: 'TOGGLE_GEN_DATA', payload: true });
        }
    }

    // Handle making sure loaded defs are reset
    useEffect(() => {
        if (loadedFieldDefs) {
            setLoadedFieldDefs(null);
            dispatch<any>(clearHighlight());
        }
    }, [selection, schemaObj]);

    const convertJSON = (data: string) => {
        try {
            // Convert to XML
            dispatch(convertData(JSON.stringify(data), LANG_JSON_UPPER, LANG_XML_UPPER, schemaObj))
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

            // Convert to CBOR
            dispatch(convertData(JSON.stringify(data[selection?.value]), LANG_JSON_UPPER, LANG_CBOR_UPPER, schemaObj))
                .then((rsp: any) => {
                    if(rsp.payload.data) {
                        if(rsp.payload.data.cbor_hex) {
                            setCbor(rsp.payload.data.cbor_hex)
                            setAnnotatedCbor(rsp.payload.data.cbor_annotated_hex)
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
                                onLoad={({fields, message}) => 
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
                            <button className={`btn btn-sm ${toggleGenData ? 'btn-warning' : 'btn-primary'} float-start ms-1`} title='Generate Data' onClick={setDefaults}>
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
                        <h5 className = "mb-0 me-1">Data Viewer</h5>
                        <div className="col-md-4 me-2">
                            <SBSelect 
                                value={selectedSerialization}
                                onChange={setSelectedSerialization}
                                data={[
                                    { label: LANG_JSON_UPPER, value: LANG_JSON_UPPER },
                                    { label: LANG_XML_UPPER, value: LANG_XML_UPPER },
                                    { label: LANG_CBOR_UPPER, value: LANG_CBOR_UPPER },
                                    { label: "Annotated CBOR", value: LANG_ANNOTATED_HEX }
                                ]}
                                isSmStyle
                            />
                        </div>
                        <div className="ms-auto">
                            <button className='btn btn-sm btn-primary float-end ms-1' title='Full Screen JSON' onClick={() => setJsonFullScreen(!jsonFullScreen)}>
                                <FontAwesomeIcon icon={faExpand} />
                            </button>
                            <>
                                <button type="button"
                                    className="btn btn-sm btn-primary me-1"
                                    onClick={() => handleValidate(selectedSerialization?.value===LANG_JSON_UPPER ? LANG_JSON_UPPER : selectedSerialization?.value===LANG_XML_UPPER ? LANG_XML_UPPER : selectedSerialization?.value===LANG_CBOR_UPPER ? LANG_CBOR_UPPER : LANG_JSON_UPPER)}
                                    disabled = {selection && generatedMessage? false:true}
                                >
                                    Valid
                                    {(selectedSerialization?.value===LANG_JSON_UPPER ? jsonValidated : selectedSerialization?.value===LANG_XML_UPPER ? xmlValidated : selectedSerialization?.value===LANG_CBOR_UPPER ? cborValidated : jsonValidated) ? (
                                        <span className="badge rounded-pill text-bg-success ms-1">
                                            <FontAwesomeIcon icon={faCheck} />
                                        </span>) : (
                                        <span className="badge rounded-pill text-bg-danger ms-1">
                                            <FontAwesomeIcon icon={faXmark} />
                                        </span>)
                                    }
                                </button>
                                <SBCompactConciseBtn ext={selectedSerialization?.value.toLowerCase()} data={generatedMessage} convertTo={toggleCompactBtn} handleClick={onCompactBtnClick} setCompact={setCompactJson} setConcise={setConciseJson} customClass={"me-1"} />
                                <SBSaveFile 
                                    buttonId={'saveMessage'} 
                                    toolTip={'Save Data'} 
                                    data={digestFormat} 
                                    loc={'messages'} 
                                    customClass={"float-end ms-1"} 
                                    ext={selectedSerialization?.value.toLowerCase()} />
                                <SBCopyToClipboard 
                                    buttonId={'copyMessage'} 
                                    data={digestFormat} 
                                    customClass='float-end' 
                                    shouldStringify={true} />
                                <SBDownloadBtn 
                                    buttonId='msgDownload' 
                                    customClass='float-end me-1' 
                                    data={digestFormat} 
                                    ext={selectedSerialization?.value.toLowerCase()} />
                            </>
                        </div>
                    </div>
                    <div className='card-body p-2'>
                        <SBEditor 
                            data={digestFormat === "" ? "Loading..." : digestFormat} 
                            convertTo={selectedSerialization?.value===LANG_XML_UPPER ? LANG_XML_UPPER : null}
                            isReadOnly={true} 
                            initialHighlightWords={highlightedItems}></SBEditor>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataCreator;