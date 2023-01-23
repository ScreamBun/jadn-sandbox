import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Input } from "reactstrap";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { getAllSchemas } from "../../reducers/util";
import { loadFile, setSchema } from "../../actions/util";
import { validateSchema } from "../../actions/validate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { sbToastError, sbToastSuccess } from "./SBToast";

const JADNSchemaLoader = (props: any) => {
    const dispatch = useDispatch();

    const { selectedFile, setSelectedFile, loadedSchema, setLoadedSchema, decodeMsg, setDecodeMsg, setDecodeSchemaTypes } = props;
    const [isValidJSON, setIsValidJSON] = useState(false);
    const [isValidJADN, setIsValidJADN] = useState(false);
    const schemaOpts = useSelector(getAllSchemas);

    useEffect(() => {
        if (selectedFile == "" || selectedFile == "file") {
            setLoadedSchema('');
            setIsValidJSON(false);
            setIsValidJADN(false);
        } else {
            try {
                dispatch(loadFile('schemas', selectedFile))
                    .then((loadFileVal) => {

                        try {
                            let schemaObj = loadFileVal.payload.data;
                            dispatch(setSchema(schemaObj))
                            setLoadedSchema(JSON.stringify(schemaObj, null, 2));
                            validateJSON(JSON.stringify(schemaObj));
                            validateJADN(JSON.stringify(schemaObj));
                            if (setDecodeSchemaTypes && setDecodeMsg) {
                                loadDecodeTypes(schemaObj); // If statement?                 
                            }
                        } catch (err) {
                            if (err instanceof Error) {
                                sbToastError(err.message);
                                return;
                            }
                        }

                    })
                    .catch((loadFileErr) => {
                        setSelectedFile('');
                        setLoadedSchema(JSON.stringify(loadFileErr.payload.data));
                    })
            } catch (err) {
                setLoadedSchema(null);
                setIsValidJADN(false);
            }
        }
    }, [selectedFile]);

    const loadDecodeTypes = (schemaObj: any) => {
        let decodeTypes = {
            all: [],
            exports: []
        };
        let msgDecode = '';

        if (schemaObj.info !== undefined) {
            if (schemaObj.info.exports !== undefined) {
                decodeTypes.exports = schemaObj.info.exports;
            }
        }
        if (schemaObj.types !== undefined) {
            decodeTypes.all = schemaObj.types.map((def: any[]) => def[0]);
            decodeTypes.all = decodeTypes.all.filter(dt => !decodeTypes.exports.includes(dt));
            decodeTypes.all.sort();
        }
        if (decodeMsg === '' || !decodeTypes.all.includes(decodeMsg)) {
            if (decodeTypes.exports.length >= 1) {
                msgDecode = decodeTypes.exports[0];
            } else if (decodeTypes.all.length >= 1) {
                msgDecode = decodeTypes.all[0];
            }
        }
        setDecodeSchemaTypes(decodeTypes);
        setDecodeMsg(msgDecode);
    }

    const formatJSON = (jsonToFormat: string) => {
        if (!jsonToFormat) {
            sbToastError(`Nothing to format`)
            return;
        }

        jsonToFormat = jsonToFormat.trim();
        jsonToFormat = validateJSON(jsonToFormat, false, true);
        if (jsonToFormat) {
            try {
                jsonToFormat = JSON.stringify(jsonToFormat, undefined, 2);
                setLoadedSchema(jsonToFormat);
                sbToastSuccess(`Data Formatted`);
            } catch (err: any) {
                sbToastError(`Unable to format: ${err.message}`)
            }
        } else {
            sbToastError(`Unable to format`)
        }
    }

    const validateJADN = (jsonToValidate: any) => {
        setIsValidJADN(false);
        try {
            dispatch(validateSchema(jsonToValidate))
                .then((validateSchemaVal: any) => {
                    if (validateSchemaVal.payload.valid_bool) {
                        setIsValidJADN(true);
                        dispatch(setSchema(jsonToValidate));
                        sbToastSuccess(validateSchemaVal.payload.valid_msg);
                    } else {
                        sbToastError(validateSchemaVal.payload.valid_msg);
                    }
                })
                .catch((validateSchemaErr) => {
                    sbToastError(validateSchemaErr.payload.valid_msg)
                })
        } catch (err) {
            if (err instanceof Error) {
                sbToastError(err.message)
            }
        }
    }

    const validateJSON = (jsonToValidate: any, onErrorReturnOrig?: boolean, showErrorPopup?: boolean) => {
        let jsonObj = null;

        if (!jsonToValidate) {
            setIsValidJSON(false);
            setIsValidJADN(false);
            sbToastError(`No data found`)
            return jsonObj;
        }

        try {
            jsonObj = JSON.parse(jsonToValidate);
            setIsValidJSON(true);
        } catch (err: any) {
            setIsValidJSON(false);
            setIsValidJADN(false);
            if (showErrorPopup) {
                sbToastError(`Invalid Format: ${err.message}`)
            }
        }

        if (onErrorReturnOrig && !jsonObj) {
            jsonObj = jsonToValidate
        }

        return jsonObj;
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            const fileReader = new FileReader();
            fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                if (ev.target) {
                    let data = ev.target.result;
                    try {
                        setLoadedSchema(data);
                    } catch (err) {
                        sbToastError(`File cannot be loaded`)
                    }
                }
            };
            fileReader.readAsText(file);
        }
    }

    const onFormatClick = (_e: React.MouseEvent<HTMLButtonElement>) => {
        formatJSON(loadedSchema);
    }

    const onSchemaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoadedSchema(e.target.value);
        validateJSON(e.target.value);
    }

    const onValidateJADNClick = (_e: React.MouseEvent<HTMLButtonElement>) => {
        let jsonObj = validateJSON(loadedSchema);
        if (!jsonObj) {
            sbToastError(`Invalid JSON. Cannot validate JADN`);
            return;
        }

        validateJADN(jsonObj);
    }

    return (
        <fieldset className="p-0">
            <legend>JADN Schema</legend>
            <div className="card">
                <div className="card-body p-0" style={{ height: '40em' }}>
                    <Input
                        type="textarea"
                        onChange={onSchemaChange}
                        value={loadedSchema}
                        className='form-control form-control-sm'
                        placeholder='Please select a schema'
                        style={{
                            resize: 'none',
                            outline: 'none',
                            width: '100%',
                            padding: '10px',
                            border: 'none',
                            height: '100%',
                            whiteSpace: 'pre',
                            overflowWrap: 'normal',
                            overflowX: 'auto'                            
                        }}
                    />
                </div>

                <div className="card-footer p-1">
                    <div className="row no-gutters">
                        <div className="col-md-6">
                            <select id="schema-list" name="schema-list" className="form-control form-control-sm" value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
                                <option value="">Select a Schema...</option>
                                <optgroup label="Testers">
                                    {schemaOpts.map((s: any) => <option key={s} value={s} >{s}</option>)}
                                </optgroup>
                                <optgroup label="Custom">
                                    <option value="file">File...</option>
                                </optgroup>
                            </select>
                            <Input type="file" id="schema-file" name="schema-file" className={`form-control form-control-sm ${selectedFile == 'file' ? '' : ' d-none'}`} accept=".jadn" onChange={onFileChange} />
                        </div>
                        <div className="col-md-6">
                            <Button id='validateJADNButton' className="float-right btn-sm" color="info" title="JADN schema must be valid" onClick={onValidateJADNClick}>
                                <span className="m-1">Validate JADN</span>
                                {isValidJADN ? (
                                    <span className="badge badge-pill badge-success">
                                        <FontAwesomeIcon icon={faCheck} />
                                    </span>) : (
                                    <span className="badge badge-pill badge-danger">
                                        <FontAwesomeIcon icon={faXmark} />
                                    </span>)
                                }
                            </Button>
                            <Button id='formatButton' className="float-right btn-sm mr-1" color="info" onClick={onFormatClick}
                                title='Attempts to Parse and Format.'>
                                <span className="m-1">Format JSON</span>
                                {isValidJSON ? (
                                    <span className="badge badge-pill badge-success">
                                        <FontAwesomeIcon icon={faCheck} />
                                    </span>) : (
                                    <span className="badge badge-pill badge-danger">
                                        <FontAwesomeIcon icon={faXmark} />
                                    </span>)
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </fieldset>)
}
export default JADNSchemaLoader;