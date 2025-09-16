import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSchemas, isSchemaValid } from "../../reducers/util";
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
import { setSchemaValid } from "actions/util";

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
        roots: string[] | []
    }) => void;
    acceptFormat?: string[];
    schemaFormat: Option | null;
    setSchemaFormat: (fmtOpt: Option | null) => void;
    showCopy?: boolean;
    showEditor?: boolean;
    showFormatter?: boolean;
    showSave?: boolean;
    showToast?: boolean;
    lightBackground?: boolean;
}

const SchemaLoader = (props: SchemaLoaderProps) => {
    const dispatch = useDispatch();

    const { selectedFile, setSelectedFile, 
            loadedSchema, setLoadedSchema, 
            decodeMsg, setDecodeMsg, 
            setDecodeSchemaTypes, 
            acceptFormat, 
            schemaFormat, 
            setSchemaFormat,
            showEditor = true, 
            showCopy = true, 
            showFormatter = true, 
            showSave = true,
            showToast = true,
            lightBackground = false
         } = props;

    const isValid = useSelector(isSchemaValid);
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
            dispatch(setSchemaValid(false));
            setSelectedFile(null);
            setSchemaFormat(null);
        }
    }, [loadedSchema])

    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    const loadDecodeTypes = (schemaObj: any) => {
        let decodeTypes: { all: any[], roots: any[] } = {
            all: [],
            roots: []
        };
        let msgDecode = '';

        if (typeof schemaObj == "string") {
            try {
                schemaObj = JSON.parse(schemaObj);
            } catch {
                schemaObj = schemaObj
            }
        }

        if (schemaObj.meta !== undefined) {
            if (schemaObj.meta.roots !== undefined) {
                decodeTypes.roots = schemaObj.meta.roots;
            }
        }
        if (schemaObj.types !== undefined) {
            decodeTypes.all = schemaObj.types.map((def: any[]) => def[0]);
            decodeTypes.all = decodeTypes.all.filter(dt => !decodeTypes.roots.includes(dt));
            decodeTypes.all.sort();
        }
        if (decodeMsg === null || !decodeTypes.all.includes(decodeMsg)) {
            if (decodeTypes.roots.length >= 1) {
                msgDecode = decodeTypes.roots[0];
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
        dispatch(setSchemaValid(false));
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
        dispatch(setSchemaValid(false));
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
                            dispatch(setSchemaValid(true));
                            if (typeof schemaObj == "string") {
                                schemaObj = JSON.parse(schemaObj);
                            }
                            dispatch(setSchema(schemaObj));
                            if (showToast){
                                sbToastSuccess(validateSchemaVal.payload.valid_msg);
                            }
                        } else {
                            sbToastError(validateSchemaVal.payload.valid_msg);
                            dispatch(setSchemaValid(false));
                            dispatch(setSchema(null));
                        }
                    })
                    .catch((validateSchemaErr) => {
                        sbToastError(validateSchemaErr.payload.valid_msg)
                        dispatch(setSchema(null));
                        dispatch(setSchemaValid(false));
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
        dispatch(setSchemaValid(false));
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
        <div className={`${lightBackground ? '' : 'card'}`}>
            <div className={`${lightBackground ? '' : 'card-header p-2'}`}>
                <div className="row no-gutters">
                    <div className={`${lightBackground ? 'col-lg-10 align-self-center' : 'col-lg-6 align-self-center'}`}>
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
                            isSaveable={showSave}
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
                    <div className={"col text-end align-self-center nowrap"}>
                        {lightBackground ? null : isValidating ? <SBSpinner action={"Validating"} color={"primary"} /> :
                            <SBValidateSchemaBtn
                                isValid={isValid}
                                setIsValid={setSchemaValid}
                                setIsValidating={setIsValidating}
                                schemaData={loadedSchema}
                                schemaFormat={schemaFormat?.value}
                                showToast={showToast}
                            />
                        }
                        {showCopy ? <SBCopyToClipboard buttonId='copySchema' data={loadedSchema} customClass='me-1' /> : <></>}
                        {showFormatter ? <SBFormatBtn customClass="me-1" handleFormatClick={onFormatClick} ext={schemaFormat?.value} data={loadedSchema} /> : <></>}

                    </div>
                </div>
            </div>
            { showEditor ? 
                <div className="card-body-page">
                    {isLoading ? <SBSpinner action={'Loading'} isDiv /> :
                        <SBEditor data={loadedSchema || ""} onChange={sbEditorOnChange}></SBEditor>}
                </div>
                :
                <></>
            }
        </div>
    )
}
export default SchemaLoader;
