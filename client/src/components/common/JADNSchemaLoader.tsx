import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAllSchemas } from "../../reducers/util";
import { info, loadFile, setSchema } from "../../actions/util";
import { validateSchema } from "../../actions/validate";
import { getFilenameExt, getFilenameOnly } from "components/utils/general";
import { dismissAllToast, sbToastError, sbToastSuccess } from "./SBToast";
import SBCopyToClipboard from "./SBCopyToClipboard";
import SBFileUploader from "./SBFileUploader";
import SBSaveFile from "./SBSaveFile";
import SBSelect, { Option } from "./SBSelect";
import SBSpinner from "./SBSpinner";
import SBFormatBtn from "./SBFormatBtn";
import SBEditor from "./SBEditor";
import { getSchemaConversions } from "reducers/convert";
import { LANG_JADN, LANG_JSON } from "components/utils/constants";

const JADNSchemaLoader = (props: any) => {
    const dispatch = useDispatch();

    const { selectedFile, setSelectedFile, loadedSchema, setLoadedSchema, decodeMsg, setDecodeMsg, setDecodeSchemaTypes, acceptFormat, schemaFormat, setSchemaFormat } = props;
    const [isValid, setIsValid] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState({
        name: '',
        ext: 'jadn'
    });
    const schemaOpts = useSelector(getAllSchemas);
    const validSchemaFormatOpt = useSelector(getSchemaConversions);
    const ref = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (fileName.ext) {
            setSchemaFormat({ value: fileName.ext, label: fileName.ext })
        }
    }, [fileName])

    useEffect(() => {
        if (!loadedSchema) {
            setIsValid(false);
            setSelectedFile('');
            setSchemaFormat(null);
        }
    }, [loadedSchema])

    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    const loadDecodeTypes = (schemaObj: any) => {
        let decodeTypes: { all: any[], exports: any[] } = {
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
        setDecodeMsg({ value: msgDecode, label: msgDecode });
    }

    const onFormatClick = (formattedSchema: object) => {
        if (formattedSchema) {
            setLoadedSchema(formattedSchema);
        }
    }

    const onValidateJADNClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        let schemaStr = loadedSchema;
        if (typeof loadedSchema != 'string') {
            schemaStr = JSON.stringify(loadedSchema);
        }
        validateJADN(schemaStr);
    }

    const onValidateJSONClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        let schemaStr = loadedSchema;
        if (typeof loadedSchema != 'string') {
            schemaStr = JSON.stringify(loadedSchema);
        }
        validateJSONSchema(schemaStr);

        return false;
    }

    const validateJSONSchema = (jsonToValidate: string) => {
        setIsValid(false);
        setIsValidating(true);

        let jsonObj = validateJSON(jsonToValidate);
        if (!jsonObj) {
            setIsValidating(false);
            sbToastError(`Invalid JSON. Cannot validate JADN`);
            return false;
        }

        try {
            dispatch(validateSchema(jsonObj, LANG_JSON))
                .then((validateSchemaVal: any) => {

                    if (validateSchemaVal.payload.valid_bool == true) {
                        setIsValid(true);
                        setLoadedSchema(jsonObj);
                        dispatch(setSchema(jsonObj));
                        sbToastSuccess(validateSchemaVal.payload.valid_msg);
                        return true;
                    } else {
                        sbToastError(validateSchemaVal.payload.valid_msg);
                        return false;
                    }

                })

                .catch((validateSchemaErr) => {
                    setIsValidating(false);
                    sbToastError(validateSchemaErr.payload.valid_msg)
                    return false;

                }).finally(() => {
                    setIsValidating(false);
                })
        } catch (err) {
            if (err instanceof Error) {
                setIsValidating(false);
                sbToastError(err.message)
                return false;
            }
        }

        return false;
    }

    const validateJADN = (jadnToValidate: string) => {
        setIsValid(false);
        setIsValidating(true);

        let jsonObj = validateJSON(jadnToValidate);
        if (!jsonObj) {
            setIsValidating(false);
            sbToastError(`Invalid JSON. Cannot validate JADN`);
            return false;
        }

        try {
            dispatch(validateSchema(jsonObj, LANG_JADN))
                .then((validateSchemaVal: any) => {
                    if (validateSchemaVal.payload.valid_bool == true) {
                        setIsValid(true);
                        setLoadedSchema(jsonObj);
                        dispatch(setSchema(jsonObj));
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
                }).finally(() => {
                    setIsValidating(false);
                })

        } catch (err) {
            if (err instanceof Error) {
                setIsValidating(false);
                sbToastError(err.message)
                return false;
                return false;
            }
        }

        return false;
    }

    const validateJSON = (jsonToValidate: any, onErrorReturnOrig?: boolean, showErrorPopup?: boolean, onClick?: boolean) => {
        if (onClick) {
            setIsValid(false);
            setIsValidating(true);
        }

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

        if (onClick) {
            setIsValidating(false);
            if (jsonObj) {
                sbToastSuccess('Valid JSON')
                setIsValid(true);
                dispatch(setSchema(jsonObj));
            }
        }

        return jsonObj;
    }

    const sbEditorOnChange = (data: string) => {
        setIsValid(false);
        setLoadedSchema(data);
        dispatch(setSchema(null));
        try {
            if (setDecodeSchemaTypes && setDecodeMsg) {
                loadDecodeTypes(JSON.parse(data));
            }
        } catch {
            return;
        }
    }

    const onFileSelect = (e: Option) => {
        setIsValid(false);
        if (e == null) {
            setSelectedFile(e);
            setLoadedSchema('');
            return;
        } else if (e.value == "file") {
            ref.current.value = '';
            ref.current?.click();
        } else {
            setSelectedFile(e);
            const fileName = {
                name: getFilenameOnly(e.label),
                ext: getFilenameExt(e.label)
            }
            setFileName(fileName);
            setIsLoading(true);

            dispatch(loadFile('schemas', e.value))
                .then((loadFileVal) => {
                    if (loadFileVal.error) {
                        setIsLoading(false);
                        sbToastError(loadFileVal.payload.response);
                        return;
                    }
                    setIsLoading(false);
                    let schemaObj = loadFileVal.payload.data;
                    let schemaStr = JSON.stringify(schemaObj);
                    if (fileName.ext == LANG_JADN) {
                        validateJADN(schemaStr);
                    } else if (fileName.ext == LANG_JSON) {
                        // validateJSON(schemaStr, false, false, true);
                        validateJSONSchema(schemaStr)
                    }
                    setLoadedSchema(schemaObj);

                    if (setDecodeSchemaTypes && setDecodeMsg) {
                        loadDecodeTypes(schemaObj);
                    }
                })
                .catch((loadFileErr) => {
                    setIsLoading(false);
                    sbToastError(loadFileErr.payload.data);
                })
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsValid(false);
        if (e.target.files && e.target.files.length != 0) {
            setIsLoading(true);
            const file = e.target.files[0];
            setSelectedFile({ 'value': file.name, 'label': file.name });
            const fileName = {
                name: getFilenameOnly(file.name),
                ext: getFilenameExt(file.name)
            }
            setFileName(fileName);

            const fileReader = new FileReader();
            fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                if (ev.target) {
                    let dataStr = ev.target.result;
                    try {
                        const dataObj: string = JSON.parse(dataStr);
                        setIsLoading(false);
                        if (fileName.ext == LANG_JADN) {
                            validateJADN(dataStr);
                        } else if (fileName.ext == LANG_JSON) {
                            validateJSONSchema(dataStr);
                        }
                        setLoadedSchema(dataObj);
                        if (setDecodeSchemaTypes && setDecodeMsg) {
                            loadDecodeTypes(dataObj);
                        }
                    } catch (err) {
                        setIsLoading(false);
                        sbToastError(`File cannot be loaded: Invalid JSON`);
                    }
                }
            };
            fileReader.readAsText(file);
        }
    }

    const onCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsLoading(false);
        setIsValidating(false);
        setIsValid(false);
        setLoadedSchema('');
        setSelectedFile(null);
        setFileName({
            name: '',
            ext: 'jadn'
        });
        if (ref.current) {
            ref.current.value = '';
        }
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className="row no-gutters">
                    <div className="col-md-6">
                        <div className="d-flex">
                            <SBSelect id={"schema-list"} data={schemaOpts} onChange={onFileSelect}
                                placeholder={'Select a schema...'}
                                loc={'schemas'}
                                value={selectedFile}
                                isGrouped
                                isFileUploader
                                isSmStyle />
                            <SBSaveFile buttonId="saveSchema" toolTip={'Save Schema'} data={loadedSchema} loc={'schemas'} customClass={"float-end ms-1"} filename={fileName?.name} ext={schemaFormat?.value} setDropdown={setSelectedFile} />
                        </div>
                        <div className='d-none'>
                            <SBFileUploader ref={ref} id={"schema-file"} accept={'.jadn, ' + acceptFormat} onCancel={onCancelFileUpload} onChange={onFileChange} />
                        </div>
                    </div>
                    <div className="col">
                        {acceptFormat &&
                            <SBSelect id={"schema-format-list"}
                                data={validSchemaFormatOpt}
                                onChange={(e: Option) => setSchemaFormat(e)}
                                value={schemaFormat}
                                placeholder={'Schema format...'}
                                isSmStyle
                            />
                        }
                    </div>
                    <div className="col">
                        <SBCopyToClipboard buttonId='copySchema' data={loadedSchema} customClass='float-end me-1' />
                        <SBFormatBtn customClass="float-end me-1" handleFormatClick={onFormatClick} ext={schemaFormat?.value} data={loadedSchema} />
                        {isValidating ? <SBSpinner action={"Validating"} color={"primary"} /> :
                            <button id='validateJADNButton' type='button' className='btn btn-sm btn-primary float-end ms-1 me-1'
                                title={isValid ? "Schema is valid" : "Click to validate Schema"}
                                onClick={schemaFormat?.value == 'jadn' ? onValidateJADNClick : onValidateJSONClick}
                            >
                                <span className="m-1">Valid</span>
                                {isValid ? (
                                    <span className="badge rounded-pill text-bg-success">
                                        <FontAwesomeIcon icon={faCheck} />
                                    </span>) : (
                                    <span className="badge rounded-pill text-bg-danger">
                                        <FontAwesomeIcon icon={faXmark} />
                                    </span>)
                                }
                            </button>}
                    </div>
                </div>
            </div>
            <div className="card-body-page">
                {isLoading ? <SBSpinner action={'Loading'} isDiv /> :
                    <SBEditor data={loadedSchema || ""} onChange={sbEditorOnChange}></SBEditor>}
            </div>
        </div>
    )
}
export default JADNSchemaLoader;
