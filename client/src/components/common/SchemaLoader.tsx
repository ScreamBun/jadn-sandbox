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

//File Loader Note: User should be able to upload any JSON/JADN schema; 
//It does not need to be syntactically correct since the user can edit the schema in the code editor.

interface SchemaLoaderProps {
    selectedFile: Option | null;
    setSelectedFile: (selectedOpt: Option | null) => void;
    loadedSchema: object | null;
    setLoadedSchema: (schema: object | null) => void;
    decodeMsg?: Option | null;
    setDecodeMsg?: (msgType: Option) => void;
    setDecodeSchemaTypes?: (obj: {
        all: string[],
        exports: string[]
    }) => void;
    acceptFormat?: string[];
    schemaFormat: Option | null;
    setSchemaFormat: (fmtOpt: Option | null) => void;
}

const SchemaLoader = (props: SchemaLoaderProps) => {
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
            setSelectedFile(null);
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
        if (decodeMsg === null || !decodeTypes.all.includes(decodeMsg)) {
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

    const onValidateSchemaClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!loadedSchema) {
            sbToastError('Validation Error: No Schema to validate');
            setIsValidating(false);
            return;
        }
        setIsValid(false);
        setIsValidating(true);

        if (schemaFormat?.value == LANG_JSON) {
            validateJSONSchema(loadedSchema);
        } else {
            validateJADNSchema(loadedSchema);
        }
    }

    const validateJSONSchema = (jsonObj: object | string) => {
        if (!jsonObj) {
            sbToastError('Validation Error: No Schema to validate');
            setIsValidating(false);
            return;
        }

        if (typeof jsonObj == 'string') {
            try {
                jsonObj = JSON.parse(jsonObj);
            } catch (err: any) {
                console.log(err)
                sbToastError(`Invalid JSON: ${err.message}`)
                setIsValidating(false);
                return;
            }
        }

        try {
            dispatch(validateSchema(jsonObj, LANG_JSON))
                .then((validateSchemaVal: any) => {
                    if (validateSchemaVal.payload.valid_bool == true) {
                        setIsValid(true);
                        setLoadedSchema(jsonObj);
                        dispatch(setSchema(jsonObj));
                        sbToastSuccess(validateSchemaVal.payload.valid_msg);
                    } else {
                        sbToastError(validateSchemaVal.payload.valid_msg);
                    }
                })
                .catch((validateSchemaErr) => {
                    sbToastError(validateSchemaErr.payload.valid_msg)

                }).finally(() => {
                    setIsValidating(false);
                })
        } catch (err) {
            if (err instanceof Error) {
                setIsValidating(false);
                sbToastError(err.message)
            }
        }
    }

    const validateJADNSchema = (jsonObj: object | string) => {
        if (!jsonObj) {
            sbToastError('Validation Error: No Schema to validate');
            setIsValidating(false);
            return;
        }

        if (typeof jsonObj == 'string') {
            try {
                jsonObj = JSON.parse(jsonObj);
            } catch (err: any) {
                console.log(err)
                sbToastError(`Invalid JSON: ${err.message}`)
                setIsValidating(false);
                return;
            }
        }

        try {
            dispatch(validateSchema(jsonObj, LANG_JADN))
                .then((validateSchemaVal: any) => {
                    if (validateSchemaVal.payload.valid_bool == true) {
                        setIsValid(true);
                        setLoadedSchema(jsonObj);
                        dispatch(setSchema(jsonObj));
                        sbToastSuccess(validateSchemaVal.payload.valid_msg);
                    } else {
                        sbToastError(validateSchemaVal.payload.valid_msg);
                    }
                })
                .catch((validateSchemaErr) => {
                    sbToastError(validateSchemaErr.payload.valid_msg)
                }).finally(() => {
                    setIsValidating(false);
                })

        } catch (err) {
            if (err instanceof Error) {
                setIsValidating(false);
                sbToastError(err.message)
            }
        }
    }

    const sbEditorOnChange = (data: string) => {
        dismissAllToast();
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
        dismissAllToast();
        setIsValid(false);
        dispatch(setSchema(null));

        if (e == null) {
            setSelectedFile(e);
            setLoadedSchema(null);
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
                    let schemaObj = loadFileVal.payload.data;
                    setLoadedSchema(schemaObj);
                    setIsLoading(false);

                    setIsValidating(true);
                    if (fileName.ext == LANG_JADN) {
                        validateJADNSchema(schemaObj);
                    } else if (fileName.ext == LANG_JSON) {
                        validateJSONSchema(schemaObj)
                    }

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
        setIsLoading(true);

        if (e.target.files && e.target.files.length != 0) {
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
                    setLoadedSchema(dataStr);
                    setIsLoading(false);

                    setIsValidating(true);
                    if (fileName.ext == LANG_JADN) {
                        validateJADNSchema(dataStr);
                    } else if (fileName.ext == LANG_JSON) {
                        validateJSONSchema(dataStr);
                    }

                    if (setDecodeSchemaTypes && setDecodeMsg) {
                        const dataObj: object = JSON.parse(dataStr);
                        loadDecodeTypes(dataObj);
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
        setLoadedSchema(null);
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
                                onClick={onValidateSchemaClick}
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
export default SchemaLoader;
