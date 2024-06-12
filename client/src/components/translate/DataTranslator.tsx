import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { getMsgFiles, getSelectedSchema, getValidMsgTypes, getAllSchemas, getPageTitle } from "reducers/util";
import SBSelect, { Option } from 'components/common/SBSelect'
import SBFileLoader from "components/common/SBFileLoader";
import { LANG_JADN, LANG_JSON } from "components/utils/constants";
import SBEditor from "components/common/SBEditor";
import SBSubmitBtn from "components/common/SBSubmitBtn";
import SBValidateSchemaBtn from "components/common/SBValidateSchemaBtn";
import { getFilenameExt, getFilenameOnly } from "components/utils/general";
import { validateSchema } from "actions/validate";
import { info, setSchema } from "../../actions/util";
import { sbToastError } from "components/common/SBToast";
import { format } from "../utils";

const DataTranslator = () => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);

    const schemaOptions = useSelector(getAllSchemas);
    const dataOptions = useSelector(getMsgFiles);
    const validDataTypes = useSelector(getValidMsgTypes)

    const [isSchemaInView, setIsSchemaInView] = useState<boolean>(true);
    const [isDataInView, setIsDataInView] = useState<boolean>(false);

    const [isSchemaValid, setSchemaIsValid] = useState(false);
    const [isDataValid, setDataIsValid] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    const [selectedSchemaFile, setSelectedSchemaFile] = useState<Option | null>(null);
    const [selectedDataFile, setSelectedDataFile] = useState<Option | null>(null);

    const [loadedSchema, setLoadedSchema] = useState<object | null>(null);    
    const [loadedData, setLoadedData] = useState<object | null>(null); 

    const [schemaFilename, setSchemaFilename] = useState({name: '', ext: LANG_JADN});
    const [dataFilename, setDataFilename] = useState({name: '', ext: LANG_JSON});
    const ref = useRef<HTMLInputElement | null>(null);

    const meta_title = useSelector(getPageTitle) + ' | Schema Translation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    const formId = "data_translation_form";    

    useEffect(() => {
        if (!loadedSchema) {
            setSchemaIsValid(false);
            setSelectedSchemaFile(null);
            // setSchemaFormat(null);
        }
    }, [loadedSchema]);

    useEffect(() => {
        if (!loadedData) {
            setDataIsValid(false);
            setSelectedDataFile(null);
        }
    }, [loadedData]);    

    useEffect(() => {
        // Gets drop down list data redux
        dispatch(info());
    }, [dispatch])    

    const onSchemaInView = () => {
        setIsSchemaInView(true);
        setIsDataInView(false);
    }    

    const onSchemaCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsSchemaInView(e.currentTarget.checked);
        setIsDataInView(!e.currentTarget.checked);
    }

    const onDataInView = () => {
        setIsSchemaInView(false);
        setIsDataInView(true);
    }      

    const onDataCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsSchemaInView(!e.currentTarget.checked);
        setIsDataInView(e.currentTarget.checked);
    }    

    const onCancelSchemaFileUpload = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement> | null) => {
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
    }

    const onCancelDataFileUpload = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement> | null) => {
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
    }    

    // TODO: Cleanup
    const onSchemaFileLoad = async (schemaObj?: any, fileOption?: Option) => {
        setSchemaIsValid(false);
        setIsLoading(true);
        onSchemaInView();

        if (schemaObj && fileOption) {
            setSelectedSchemaFile(fileOption);
            const fileName = {
                name: getFilenameOnly(fileOption.label),
                ext: getFilenameExt(fileOption.label)
            }
            setSchemaFilename(fileName);
            setLoadedSchema(schemaObj);
            try {
                dispatch(validateSchema(schemaObj, fileName.ext))
                    .then((validateSchemaVal: any) => {
                        if (validateSchemaVal.payload.valid_bool == true) {
                            setSchemaIsValid(true);
                            if (typeof schemaObj == "string") {
                                schemaObj = JSON.parse(schemaObj);
                            }
                            dispatch(setSchema(schemaObj));
                            // sbToastSuccess(validateSchemaVal.payload.valid_msg);
                        } else {
                            sbToastError(validateSchemaVal.payload.valid_msg);
                            dispatch(setSchema(null)); // TODO: is this needed?
                        }
                    })
                    .catch((validateSchemaErr) => {
                        sbToastError(validateSchemaErr.payload.valid_msg)
                        dispatch(setSchema(null)); // TODO: is this needed?
                    }).finally(() => {
                        setIsValidating(false);
                    })
            } catch (err) {
                if (err instanceof Error) {
                    setIsValidating(false);
                    sbToastError(err.message)
                }
            }

            // if (setDecodeSchemaTypes && setDecodeMsg) {
            //     loadDecodeTypes(schemaObj);
            // }
        }
        setIsLoading(false);
    } 
    
    const onDataFileLoad = async (dataFile?: any, fileOption?: Option) => {
        setDataIsValid(false);
        setIsLoading(true);        
        onDataInView();

        if (fileOption) {
            setSelectedDataFile(fileOption);
            const fileName = {
                name: getFilenameOnly(fileOption.label),
                ext: getFilenameExt(fileOption.label) || LANG_JSON
            }
            setDataFilename(fileName);
            if (dataFile) {
                // fileName.ext == LANG_JADN ? setMsgFormat({ value: LANG_JSON, label: LANG_JSON }) : setMsgFormat({ value: fileName.ext, label: fileName.ext });
                fileName.ext == LANG_JSON;
                const formattedData = format(dataFile, fileName.ext, 2);
                if (formattedData.startsWith('Error')) {
                    setLoadedData(dataFile);
                } else {
                    // setLoadedData(formattedData);
                    setLoadedData(dataFile);
                }
            } 
            // else {
            //     switch (fileName.ext) {
            //         case 'cbor':
            //             dataFile = escaped2cbor(hexify(dataFile));
            //             break;
            //         default:
            //             sbToastError(`File cannot be loaded: Invalid JSON`);
            //     }
            // }
        }
        setIsLoading(false) 
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
                            <div className='col-md-6'>
                                <div className="card">
                                    <div className="card-header">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className={`d-flex`}>
                                                    <input id="schemaViewCheckbox" type="checkbox" className="form-check-input mt-2 me-1" title="View JADN Schema" checked={isSchemaInView} onChange={onSchemaCheckChange} />
                                                    <SBFileLoader
                                                        opts={schemaOptions}
                                                        selectedOpt={selectedSchemaFile}
                                                        loadedFileData={loadedSchema}
                                                        fileName={schemaFilename}
                                                        fileExt={LANG_JADN}
                                                        setSelectedFile={setSelectedSchemaFile}
                                                        onCancelFileUpload={onCancelSchemaFileUpload}
                                                        onFileChange={onSchemaFileLoad}
                                                        acceptableExt={LANG_JADN}
                                                        ref={ref}
                                                        placeholder={'Select a schema...'}
                                                        loc={'schemas'}
                                                        isSaveable/>
                                                    <SBValidateSchemaBtn
                                                        id={'schemaValidationButton'}
                                                        isValid={isSchemaValid}
                                                        setIsValid={setSchemaIsValid}
                                                        setIsValidating={setIsValidating}
                                                        schemaData={loadedSchema}
                                                        schemaFormat={LANG_JADN} />   
                                                </div>                                                 
                                            </div>
                                            <div className="col-md-6">
                                                <div className={`d-flex`}>
                                                    <input id="dataViewCheckbox" type="checkbox" className="form-check-input mt-2 me-1" title="View Data" checked={isDataInView} onChange={onDataCheckChange} />
                                                    <SBFileLoader
                                                        opts={dataOptions}
                                                        selectedOpt={selectedDataFile}
                                                        fileName={dataFilename}
                                                        setSelectedFile={setSelectedDataFile}
                                                        onCancelFileUpload={onCancelDataFileUpload}
                                                        onFileChange={onDataFileLoad}
                                                        // acceptableExt={'.json, .cbor, .xml'}
                                                        acceptableExt={'.json'}
                                                        ref={ref}
                                                        placeholder={'Select a data file...'}
                                                        loc={'messages'} 
                                                        isSaveable />
                                                    <SBValidateSchemaBtn
                                                        id={'dataValidationButton'}
                                                        isValid={isDataValid}
                                                        setIsValid={setDataIsValid}
                                                        setIsValidating={setIsValidating}
                                                        schemaData={loadedData}
                                                        schemaFormat={""} />
                                                </div>                                                    
                                            </div>                                  
                                        </div>
                                    </div>
                                    <div className="card-body p-0 m-0">
                                        { isSchemaInView == true ?
                                            <div key='schemaEditor'>
                                                <SBEditor data={loadedSchema || ''} convertTo={LANG_JADN} onChange={''}></SBEditor>
                                            </div>
                                        : 
                                            <div key='dataEditor'>
                                                <SBEditor data={loadedData || ''} convertTo={LANG_JSON} onChange={''}></SBEditor>
                                            </div>
                                        } 
                                    </div>
                                </div>
                                                          
                            </div>
                            <div className='col-md-6'>
                                <div className="card">
                                    <div className="card-header p-2">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className={`d-flex`}>
                                                    <SBSelect id={"data-format-list"}
                                                                // customClass={''}
                                                                data={validDataTypes}
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
                                    </div>
                                    <div className="card-body p-0 m-0">
                                        <SBEditor data={''} convertTo={''} onChange={''}></SBEditor> 
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