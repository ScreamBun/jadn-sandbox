import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSchemas } from "../../reducers/util";
import { info, setSchema } from "../../actions/util";
import { getSchemaConversions } from "reducers/convert";
import { validateSchema } from "actions/validate";
import { LANG_JADN } from "components/utils/constants";
import { getFilenameExt, getFilenameOnly } from "components/utils/general";
import { dismissAllToast, sbToastError, sbToastSuccess } from "./SBToast";
import SBCopyToClipboard from "./SBCopyToClipboard";
import SBSelect, { Option } from "./SBSelect";
import SBSpinner from "./SBSpinner";
import SBFormatBtn from "./SBFormatBtn";
import SBEditor from "./SBEditor";
import SBValidateSchemaBtn from "./SBValidateSchemaBtn";
import SBFileLoader from "./SBFileLoader";

//File Loader Note: User should be able to upload any JSON/JADN schema; 
//It does not need to be syntactically correct since the user can edit the schema in the code editor.

interface SchemaLoaderProps {
    selectedFile: Option | null;
    setSelectedFile: (selectedOpt: Option | null) => void;
    loadedSchema: object | null;
    setLoadedSchema: (schema: object | null) => void;
    decodeMsg?: Option | null;
    setDecodeMsg?: (msgType: Option | null) => void;
    setDecodeSchemaTypes?: (obj: {
        all: string[] | [],
        exports: string[] | []
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
        ext: LANG_JADN
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

        if (typeof schemaObj == "string") {
            try {
                schemaObj = JSON.parse(schemaObj);
            } catch {
                schemaObj = schemaObj
            }
        }

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

    const onFileLoad = async (schemaObj?: any, fileStr?: Option) => {
        setIsValid(false);
        setIsLoading(true);
        if (schemaObj && fileStr) {
            setSelectedFile(fileStr);
            const fileName = {
                name: getFilenameOnly(fileStr.label),
                ext: getFilenameExt(fileStr.label)
            }
            setFileName(fileName);
            setLoadedSchema(schemaObj);
            try {
                dispatch(validateSchema(schemaObj, fileName.ext))
                    .then((validateSchemaVal: any) => {
                        if (validateSchemaVal.payload.valid_bool == true) {
                            setIsValid(true);
                            if (typeof schemaObj == "string") {
                                schemaObj = JSON.parse(schemaObj);
                            }
                            dispatch(setSchema(schemaObj));
                            sbToastSuccess(validateSchemaVal.payload.valid_msg);
                        } else {
                            sbToastError(validateSchemaVal.payload.valid_msg);
                            dispatch(setSchema(null));
                        }
                    })
                    .catch((validateSchemaErr) => {
                        sbToastError(validateSchemaErr.payload.valid_msg)
                        dispatch(setSchema(null));
                    }).finally(() => {
                        setIsValidating(false);
                    })
            } catch (err) {
                if (err instanceof Error) {
                    setIsValidating(false);
                    sbToastError(err.message)
                }
            }

            if (setDecodeSchemaTypes && setDecodeMsg) {
                loadDecodeTypes(schemaObj);
            }
        }
        setIsLoading(false);
    }

    const onCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement> | null) => {
        if (e) {
            e.preventDefault();
        }
        dismissAllToast();
        setIsLoading(false);
        setIsValidating(false);
        setIsValid(false);
        setLoadedSchema(null);
        dispatch(setSchema(null));
        setSelectedFile(null);
        setFileName({
            name: '',
            ext: LANG_JADN
        });
        if (ref.current) {
            ref.current.value = '';
        }
        if (setDecodeSchemaTypes && setDecodeMsg) {
            setDecodeMsg(null);
            setDecodeSchemaTypes([]);
        }
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className="row no-gutters">
                    <div className="col-lg-6 align-self-center">
                        <SBFileLoader
                            opts={schemaOpts}
                            selectedOpt={selectedFile}
                            loadedFileData={loadedSchema}
                            fileName={fileName}
                            fileExt={schemaFormat?.value}
                            setSelectedFile={setSelectedFile}
                            onCancelFileUpload={onCancelFileUpload}
                            onFileChange={onFileLoad}
                            acceptableExt={acceptFormat}
                            ref={ref}
                            placeholder={'Select a schema...'}
                            loc={'schemas'}
                            isSaveable
                        />
                    </div>
                    {acceptFormat && <div className="col-lg-3 align-self-center">
                        <SBSelect id={"schema-format-list"}
                            data={validSchemaFormatOpt}
                            onChange={(e: Option) => setSchemaFormat(e)}
                            value={schemaFormat}
                            placeholder={'Schema format...'}
                            isSmStyle
                            isClearable />
                    </div>}
                    <div className="col text-end align-self-center nowrap">
                        {isValidating ? <SBSpinner action={"Validating"} color={"primary"} /> :
                            <SBValidateSchemaBtn
                                isValid={isValid}
                                setIsValid={setIsValid}
                                setIsValidating={setIsValidating}
                                schemaData={loadedSchema}
                                schemaFormat={schemaFormat?.value}
                            />
                        }
                        <SBCopyToClipboard buttonId='copySchema' data={loadedSchema} customClass='me-1' />
                        <SBFormatBtn customClass="me-1" handleFormatClick={onFormatClick} ext={schemaFormat?.value} data={loadedSchema} />

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
