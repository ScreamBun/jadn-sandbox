import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "reactstrap";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { getAllSchemas } from "../../reducers/util";
import { info, loadFile, setSchema } from "../../actions/util";
import { validateSchema } from "../../actions/validate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { dismissAllToast, sbToastError, sbToastSuccess } from "./SBToast";
import SBCopyToClipboard from "./SBCopyToClipboard";
import SBEditor from "./SBEditor";
import { LANG_JSON } from "components/utils/constants";
import SBFileUploader from "./SBFileUploader";
import { FormatJADN } from "components/utils";
import SBSaveFile from "./SBSaveFile";
import SBSelect, { Option } from "./SBSelect";

const JADNSchemaLoader = (props: any) => {
    const dispatch = useDispatch();

    const { selectedFile, setSelectedFile, setLoadedSchema, decodeMsg, setDecodeMsg, setDecodeSchemaTypes } = props;
    const [isValidJADN, setIsValidJADN] = useState(false);
    const schemaOpts = useSelector(getAllSchemas);
    const [currSchema, setCurrSchema] = useState(''); //setLoadedSchema if JADN is valid
    const [fileName, setFileName] = useState('');
    const ref = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        dispatch(info());
    }, [dispatch])

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

    const onFormatClick = (_e: React.MouseEvent<HTMLButtonElement>) => {
        try {
            const schemaObj = JSON.parse(currSchema);
            const schemaStr = FormatJADN(schemaObj);
            setCurrSchema(schemaStr);
        } catch {
            sbToastError('Failed to format: Invalid JSON')
        }
    }

    const onValidateJADNClick = (_e: React.MouseEvent<HTMLButtonElement>) => {
        validateJADN(currSchema);
    }

    const validateJADN = (jsonToValidate: any) => {
        setIsValidJADN(false);
        setLoadedSchema('');
        let jsonObj = validateJSON(jsonToValidate);
        if (!jsonObj) {
            sbToastError(`Invalid JSON. Cannot validate JADN`);
            return false;
        }

        try {
            dispatch(validateSchema(jsonObj))
                .then((validateSchemaVal: any) => {
                    if (validateSchemaVal.payload.valid_bool == true) {
                        setIsValidJADN(true);
                        setLoadedSchema(JSON.stringify(jsonObj));
                        sbToastSuccess(validateSchemaVal.payload.valid_msg);
                        return true;
                    } else {
                        sbToastError(validateSchemaVal.payload.valid_msg);
                        return false;
                    }
                })
                .catch((validateSchemaErr) => {
                    sbToastError(validateSchemaErr.payload.valid_msg)
                    return false;
                })
        } catch (err) {
            if (err instanceof Error) {
                sbToastError(err.message)
                return false;
            }
        }
        return false;
    }

    const validateJSON = (jsonToValidate: any, onErrorReturnOrig?: boolean, showErrorPopup?: boolean) => {
        let jsonObj = null;

        if (!jsonToValidate) {
            sbToastError(`No data found`)
            return jsonObj;
        }

        try {
            jsonObj = JSON.parse(jsonToValidate);
        } catch (err: any) {
            if (showErrorPopup) {
                sbToastError(`Invalid Format: ${err.message}`)
            }
        }

        if (onErrorReturnOrig && !jsonObj) {
            jsonObj = jsonToValidate
        }

        return jsonObj;
    }

    const sbEditorOnChange = (data: any) => {
        dispatch(setSchema(data));
        setIsValidJADN(false);
        setLoadedSchema('');
        setCurrSchema(data);
        try {
            if (setDecodeSchemaTypes && setDecodeMsg) {
                loadDecodeTypes(JSON.parse(data));
            }
        } catch {
            return;
        }
    }

    const onFileSelect = (e: Option) => {
        setIsValidJADN(false);
        setLoadedSchema('');
        setCurrSchema('');
        if (e == null) {
            setSelectedFile('');
            return;
        }
        setSelectedFile(e.value);
        if (e.value == "file") {
            ref.current.click();

        } else {
            setFileName(e.value.split('.')[0]);

            dispatch(loadFile('schemas', e.value))
                .then((loadFileVal) => {
                    if (loadFileVal.error) {
                        sbToastError(loadFileVal.payload.response);
                        return;
                    }
                    let schemaObj = loadFileVal.payload.data;
                    let schemaStr = JSON.stringify(schemaObj);
                    validateJADN(schemaStr);
                    setCurrSchema(FormatJADN(schemaObj));
                    dispatch(setSchema(schemaObj));

                    if (setDecodeSchemaTypes && setDecodeMsg) {
                        loadDecodeTypes(schemaObj);
                    }
                })
                .catch((loadFileErr) => {
                    sbToastError(loadFileErr.payload.data);
                })
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dismissAllToast();
        setIsValidJADN(false);
        setCurrSchema('');
        setLoadedSchema('');
        if (e.target.files && e.target.files.length != 0) {
            const file = e.target.files[0];
            setFileName(file.name.split('.')[0]);
            const fileReader = new FileReader();
            fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                if (ev.target) {
                    let dataStr = ev.target.result;
                    try {
                        dispatch(setSchema(JSON.parse(dataStr)));
                        validateJADN(dataStr);
                        setCurrSchema(dataStr);
                        if (setDecodeSchemaTypes && setDecodeMsg) {
                            loadDecodeTypes(JSON.parse(dataStr));
                        }
                    } catch (err) {
                        sbToastError(`File cannot be loaded: Invalid JSON`)
                    }
                }
            };
            fileReader.readAsText(file);
        }
    }

    const onCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsValidJADN(false);
        setSelectedFile('');
        setFileName('');
        setCurrSchema('');
        setLoadedSchema('');
        if (ref.current) {
            ref.current.value = '';
        }
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className="row no-gutters">
                    <div className="col-md-6">
                        <div className={`${selectedFile == 'file' ? ' d-none' : ''}`}>
                            <SBSelect id={"schema-list"} data={schemaOpts} onChange={onFileSelect}
                                placeholder={'Select a schema...'}
                                loc={'schemas'}
                                isGrouped />
                        </div>
                        <div className={`${selectedFile == 'file' ? '' : ' d-none'}`} style={{ display: 'inline' }}>
                            <SBFileUploader ref={ref} id={"schema-file"} accept={".jadn"} onCancel={onCancelFileUpload} onChange={onFileChange} />
                        </div>
                    </div>
                    <div className="col">
                        <SBCopyToClipboard buttonId='copySchema' data={currSchema} customClass='float-right mr-1' />
                        <SBSaveFile data={currSchema} loc={'schemas'} customClass={"float-right mr-1"} filename={fileName} />
                        <Button id='validateJADNButton' className="float-right btn-sm mr-1" color="info" title={isValidJADN ? "JADN schema is valid" : "JADN must be valid. Click to validate JADN"} onClick={onValidateJADNClick}>
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
                            <span className="m-1">Format JADN</span>
                        </Button>
                    </div>
                </div>
            </div>
            <div className="card-body p-0">
                <SBEditor data={currSchema} onChange={sbEditorOnChange} convertTo={LANG_JSON}></SBEditor>
            </div>
        </div>
    )
}
export default JADNSchemaLoader;
