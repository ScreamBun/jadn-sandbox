import SchemaLoader from "components/common/SchemaLoader";
import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { getMsgFiles, getSelectedSchema, getValidMsgTypes, getAllSchemas, getPageTitle } from "reducers/util";
import SBSelect, { Option } from 'components/common/SBSelect'
import SBFileLoader from "components/common/SBFileLoader";
import { LANG_JADN } from "components/utils/constants";
import SBEditor from "components/common/SBEditor";
import SBSubmitBtn from "components/common/SBSubmitBtn";

const DataTranslator = () => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);

    const schemaOpts = useSelector(getAllSchemas);
    const msgOpts = useSelector(getMsgFiles);
    const validMsgFormat = useSelector(getValidMsgTypes)

    const [selectedFile, setSelectedFile] = useState<Option | null>(null);
    const [loadedSchema, setLoadedSchema] = useState<object | null>(null);    
    const [fileName, setFileName] = useState({name: '', ext: LANG_JADN});
    const ref = useRef<HTMLInputElement | null>(null);

    const meta_title = useSelector(getPageTitle) + ' | Schema Translation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    const formId = "data_translation_form";    

    useEffect(() => {
        if (!loadedSchema) {
            // setIsValid(false);
            setSelectedFile(null);
            // setSchemaFormat(null);
        }
    }, [loadedSchema])

    // useEffect(() => {
    //     dispatch(info());
    // }, [dispatch])    

    const onCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement> | null) => {
        if (e) {
            e.preventDefault();
        }
        // dismissAllToast();
        // setIsLoading(false);
        // setIsValidating(false);
        // setIsValid(false);
        // setLoadedSchema(null);
        // dispatch(setSchema(null));
        // setSelectedFile(null);
        // setFileName({
        //     name: '',
        //     ext: LANG_JADN
        // });
        // if (ref.current) {
        //     ref.current.value = '';
        // }
        // if (setDecodeSchemaTypes && setDecodeMsg) {
        //     setDecodeMsg(null);
        //     setDecodeSchemaTypes([]);
        // }
    }

    const onFileLoad = async (schemaObj?: any, fileStr?: Option) => {
        // setIsValid(false);
        // setIsLoading(true);
        // if (schemaObj && fileStr) {
        //     setSelectedFile(fileStr);
        //     const fileName = {
        //         name: getFilenameOnly(fileStr.label),
        //         ext: getFilenameExt(fileStr.label)
        //     }
        //     setFileName(fileName);
        //     setLoadedSchema(schemaObj);
        //     try {
        //         dispatch(validateSchema(schemaObj, fileName.ext))
        //             .then((validateSchemaVal: any) => {
        //                 if (validateSchemaVal.payload.valid_bool == true) {
        //                     setIsValid(true);
        //                     if (typeof schemaObj == "string") {
        //                         schemaObj = JSON.parse(schemaObj);
        //                     }
        //                     dispatch(setSchema(schemaObj));
        //                     sbToastSuccess(validateSchemaVal.payload.valid_msg);
        //                 } else {
        //                     sbToastError(validateSchemaVal.payload.valid_msg);
        //                     dispatch(setSchema(null));
        //                 }
        //             })
        //             .catch((validateSchemaErr) => {
        //                 sbToastError(validateSchemaErr.payload.valid_msg)
        //                 dispatch(setSchema(null));
        //             }).finally(() => {
        //                 setIsValidating(false);
        //             })
        //     } catch (err) {
        //         if (err instanceof Error) {
        //             setIsValidating(false);
        //             sbToastError(err.message)
        //         }
        //     }

        //     if (setDecodeSchemaTypes && setDecodeMsg) {
        //         loadDecodeTypes(schemaObj);
        //     }
        // }
        // setIsLoading(false);
    }    

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {

    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {

    }

    return (
        <div>
            <Helmet>
                <title>{meta_title}</title>
                <link rel="canonical" href={meta_canonical} />
            </Helmet>
            <div className='card'>
                <div className='card-header bg-secondary p-2'>
                    <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Data Translation</span></h5>
                    <button type='reset' className='btn btn-sm btn-danger float-end' onClick={onReset}>Reset</button>
                </div>
                <div className='card-body p-2'>
                    <form id={formId} onSubmit={submitForm}>
                        <div className='row'>
                            <div className='col-md-6 pr-1'>
                                <div className="row">
                                    <div className="col-md-6">
                                        <SBFileLoader
                                            opts={schemaOpts}
                                            selectedOpt={selectedFile}
                                            loadedFileData={loadedSchema}
                                            fileName={fileName}
                                            fileExt={LANG_JADN}
                                            setSelectedFile={setSelectedFile}
                                            onCancelFileUpload={onCancelFileUpload}
                                            onFileChange={onFileLoad}
                                            acceptableExt={LANG_JADN}
                                            ref={ref}
                                            placeholder={'Select a schema...'}
                                            loc={'schemas'}
                                            isSaveable/>
                                    </div>
                                    <div className="col-md-6">
                                        <SBFileLoader
                                            opts={msgOpts}
                                            selectedOpt={selectedFile}
                                            fileName={fileName}
                                            setSelectedFile={setSelectedFile}
                                            onCancelFileUpload={onCancelFileUpload}
                                            onFileChange={onFileLoad}
                                            acceptableExt={'.json, .cbor, .xml'}
                                            ref={ref}
                                            placeholder={'Select a data file...'}
                                            loc={'messages'} 
                                            isSaveable />
                                    </div>                                  
                                </div>
                                <div className="row">
                                    <div className="col-md-12 mt-2">
                                        <SBEditor data={''} convertTo={''} onChange={''}></SBEditor>                                        
                                    </div>                                                           
                                </div>                                                           
                            </div>
                            <div className='col-md-6 pl-1'>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className={`d-flex`}>
                                            <SBSelect id={"data-format-list"}
                                                        // customClass={''}
                                                        data={validMsgFormat}
                                                        // onChange={(e: Option) => setMsgFormat(e)}
                                                        // value={msgFormat}
                                                        value={''}
                                                        placeholder={'Translate to...'}
                                                        isSmStyle
                                                        isClearable />

                                            <SBSubmitBtn buttonId="translateSubmit"
                                                buttonTitle="Translate data"
                                                buttonTxt="Translate"
                                                customClass="ms-2"
                                                isLoading={isLoading}
                                                formId={formId}
                                                // isDisabled={Object.keys(validSchema).length != 0 && loadedMsg && decodeMsg && msgFormat ? false : true}
                                                />    
                                        </div>                                     
                                    </div>                                                           
                                </div>
                                <div className="row">
                                    <div className="col-md-12 mt-2">
                                        <SBEditor data={''} convertTo={''} onChange={''}></SBEditor> 
                                    {/* <SchemaTranslated
                                        formId={formId}
                                        translatedSchema={translatedSchema} setTranslatedSchema={setTranslatedSchema}
                                        translation={translation} setTranslation={setTranslation}
                                        setSchemaFormat={setSchemaFormat}
                                        isLoading={isLoading} ext={schemaFormat?.value} /> */}                                     
                                    </div>                                                           
                                </div>                                
                            </div>
                        </div>
                    </form>
                </div>                            
            </div>
        </div>
    )

}

export default DataTranslator