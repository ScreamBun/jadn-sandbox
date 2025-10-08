import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import DataToTranslate from './DataToTranslate'
import { validateMessage } from 'actions/validate'
import { info, setFile, setSchema, setSchemaValid } from 'actions/util'
import { getPageTitle, getSelectedFile, getSelectedSchema } from 'reducers/util'
import SchemaLoader from 'components/common/SchemaLoader'
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast'
import SBSelect, { Option } from 'components/common/SBSelect'
import SBActionBtn from 'components/common/SBActionBtn'
import { LANG_CBOR, LANG_JSON, LANG_XML } from 'components/utils/constants'
import { convertData } from "actions/convert";
import CborTranslated from './CborTranslated'
import XmlTranslated from './XmlTranslated'
import { useLocation } from 'react-router-dom'
import { removeXmlWrapper } from 'components/create/data/lib/utils'


const DataTranslator = () => {

    const dispatch = useDispatch();
    const location = useLocation();

    const loadedSchema = useSelector(getSelectedSchema);
    const setLoadedSchema = (schema: object | null) => {
        dispatch(setSchema(schema));
    }

    const selectedSchemaFile = useSelector(getSelectedFile);
    const setSelectedSchemaFile = (file: Option | null) => {
        dispatch(setFile(file));
    }

    const [isLoading, setIsLoading] = useState(false);
    const [isDataValid, setIsDataValid] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [schemaFormat, setSchemaFormat] = useState<Option | null>(null);
    const [selectedDataFile, setSelectedDataFile] = useState('');
    const [loadedData, setLoadedData] = useState('');
    const [cborAnnoHex, setCborAnnoHex] = useState('');
    const [cborHex, setCborHex] = useState('');
    const [xml, setXml] = useState('');
    const [dataFormat, setDataFormat] = useState<Option | null>(null);
    const [convertTo, setConvertTo] = useState<Option | null>({'label': LANG_CBOR, 'value' : LANG_CBOR});
    const [dataType, setDataType] = useState<Option | null>(null);
    const [schemaTypes, setSchemaTypes] = useState<{
        all: string[],
        roots: string[]
    }>({
        all: [],
        roots: []
    });

    const meta_title = useSelector(getPageTitle) + ' | Data Translation';
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    const formId = "validation_form";  
    
    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch]);

    useEffect(() => {
        if (location.state) {
            setConvertTo({ value: location.state, label: location.state });
        }
    }, [])    

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsLoading(false);
        setSelectedSchemaFile(null);
        setLoadedSchema(null);
        setSelectedDataFile('');
        setLoadedData('');
        setCborAnnoHex('');
        setCborHex('');
        setDataFormat(null);
        setConvertTo(null);
        setDataType(null);
        setSchemaTypes({
            all: [],
            roots: []
        });
        dispatch(setSchema(null));
        dispatch(setSchemaValid(false))
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setIsDataValid(false);

        if (loadedSchema && loadedData && dataFormat && dataType) {
            try {
                const rootType = dataType.value;
                let newMsg = dataFormat.label === "JSON" || dataFormat.label === "json" ? JSON.stringify(JSON.parse(loadedData)[rootType]) : dataFormat.label === "XML" || dataFormat.label === "xml" ? removeXmlWrapper(loadedData) : loadedData;
                newMsg = newMsg === undefined ? loadedData : newMsg; // if rootType not found, use original message
                dispatch(validateMessage(loadedSchema, newMsg, dataFormat.value, rootType))
                    .then((submitVal: any) => {
                        if (submitVal && submitVal.payload.valid_bool) {
                            setIsLoading(false);
                            setIsDataValid(true);
                        } else {
                            if (submitVal.payload.valid_msg.length != 1 && typeof submitVal.payload.valid_msg == 'object') {
                                setIsLoading(false);
                                for (const index in submitVal.payload.valid_msg) {
                                    sbToastError(submitVal.payload.valid_msg[index])
                                }
                            } else {
                                setIsLoading(false);
                                sbToastError(submitVal.payload.valid_msg)
                            }
                        }
                    })
                    .catch((submitErr: { message: string }) => {
                        setIsLoading(false);
                        sbToastError(submitErr.message)
                        return false;
                    })
            } catch (err) {
                if (err instanceof Error) {
                    setIsLoading(false);
                    sbToastError(err.message)
                }
            }
        } else {
            var err = '';
            if (!loadedSchema) {
                err += ' schema';
            }
            if (!loadedData) {
                err += ', data';
            }
            if (!dataFormat) {
                err += ', data format';
            }
            if (!dataType) {
                err += ', data type';
            }
            sbToastError('ERROR: Validation failed - Please select ' + err)
            setIsLoading(false);
        }
    } 

    const onTranslateClick = (e: React.MouseEvent<HTMLButtonElement>)  => {
        e.preventDefault();
        setIsTranslating(true);

        if (!convertTo){
            setIsTranslating(false);
            return 
        }

        try {
            dispatch(convertData(loadedData, LANG_JSON, convertTo.value))
                .then((rsp: any) => {
                    setIsTranslating(false);

                    if(rsp.payload.data) {
                        
                        if(rsp.payload.data.cbor_annotated_hex) {
                            setCborAnnoHex(rsp.payload.data.cbor_annotated_hex)
                        }
    
                        if(rsp.payload.data.cbor_hex) {
                            setCborHex(rsp.payload.data.cbor_hex)
                        } 
                        
                        if(rsp.payload.data.xml) {
                            setXml(rsp.payload.data.xml)
                        } 

                        sbToastSuccess("Translation complete");
                    } else {
                        console.log(rsp.payload.message);
                        sbToastError("Error translating data");
                    }
                    
                })
                .catch((submitErr: { message: string }) => {
                    setIsTranslating(false);
                    sbToastError(submitErr.message)
                });
        } catch (err) {
            if (err instanceof Error) {
                setIsTranslating(false);
                sbToastError(err.message)
            }
        }        

    }    

    const TranslationView = () => {
        if (convertTo && convertTo.value === LANG_CBOR) {
            return (
                <CborTranslated cborHex={cborHex} cborAnnoHex={cborAnnoHex} ></CborTranslated>
            )
        } else if (convertTo && convertTo.value === LANG_XML) {
            return (
                <XmlTranslated xml={xml}></XmlTranslated>
            )
        } else {
            return (
                <></>
            )
        }
    }

    return (
        <div>
            <Helmet>
                <title>{meta_title}</title>
                <link rel="canonical" href={meta_canonical} />
            </Helmet>
            <div className='row'>
                <div className='col-md-12'>
                    <div className='card'>
                        <div className='card-header bg-secondary p-2'>
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Data Translation</span></h5>
                            <button type='reset' className='btn btn-sm btn-danger float-end' onClick={onReset}>Reset</button>
                        </div>
                        <div className='card-body p-2'>
                            <form id={formId} onSubmit={submitForm}>
                                <div className='row'>
                                    <div className='col-md-6 pe-1'>
                                        <div>
                                            <SchemaLoader
                                                selectedFile={selectedSchemaFile} setSelectedFile={setSelectedSchemaFile}
                                                schemaFormat={schemaFormat} setSchemaFormat={setSchemaFormat}
                                                loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema}
                                                decodeMsg={dataType} setDecodeMsg={setDataType}
                                                setDecodeSchemaTypes={setSchemaTypes}
                                                showCopy={false}
                                                showEditor={false}
                                                showFormatter={false}
                                                showSave={false}
                                                showToast={false} />
                                        </div>
                                        <div className='mt-2'>
                                            <DataToTranslate
                                                selectedFile={selectedDataFile} setSelectedFile={setSelectedDataFile}
                                                loadedData={loadedData} setLoadedData={setLoadedData}
                                                dataFormat={dataFormat} setDataFormat={setDataFormat}
                                                dataType={dataType} setDataType={setDataType}
                                                schemaTypes={schemaTypes}
                                                isLoading={isLoading} 
                                                isDataValid={isDataValid} setIsDataValid={setIsDataValid}
                                                formId={formId}
                                            />
                                        </div>                                         
                                    </div>
                                    <div className='col-md-6 ps-1'>
                                        <div className="card">
                                            <div className="card-header p-2">
                                                <div className='row'>
                                                    <div className='col-md-4'>
                                                        <SBSelect id={"data-format-list"}
                                                            customClass={'me-1'}
                                                            data={[LANG_CBOR, LANG_XML]}
                                                            onChange={(e: Option) => setConvertTo(e)}
                                                            value={convertTo}
                                                            placeholder={'Convert to...'}
                                                            isSmStyle
                                                            isClearable 
                                                        />
                                                    </div>
                                                    <div className='col-md-8'>
                                                        <SBActionBtn buttonId={'translateBtn'} 
                                                            buttonTitle={'Click to translate data into another langauge'}
                                                            buttonTxt={'Translate'}
                                                            customClass={'ms-1 float-end'} 
                                                            isLoading={isTranslating}
                                                            isDisabled={isDataValid ? false : true}
                                                            onBtnClick={onTranslateClick}>
                                                        </SBActionBtn> 
                                                    </div>                                                    
                                                </div>                                               
                                            </div>
                                            <div className="card-body p-2">
                                                <TranslationView></TranslationView>
                                            </div>
                                        </div>
                                    </div>
                                </div>                                
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default DataTranslator    