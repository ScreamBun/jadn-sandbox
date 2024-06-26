import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import DataTranslated from './DataTranslated'
import { validateMessage } from 'actions/validate'
import { info, setSchema } from 'actions/util'
import { getPageTitle } from 'reducers/util'
import SchemaLoader from 'components/common/SchemaLoader'
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast'
import SBSelect, { Option } from 'components/common/SBSelect'
import SBEditor from 'components/common/SBEditor'
import SBActionBtn from 'components/common/SBActionBtn'
import { LANG_ANNOTATED_HEX, LANG_JSON } from 'components/utils/constants'
import { convertData } from "actions/convert";


const DataTranslator = () => {

    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [isDataValid, setIsDataValid] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [selectedSchemaFile, setSelectedSchemaFile] = useState<Option | null>(null);
    const [schemaFormat, setSchemaFormat] = useState<Option | null>(null);
    const [loadedSchema, setLoadedSchema] = useState<object | null>(null);
    const [selectedMsgFile, setSelectedMsgFile] = useState('');
    const [loadedMsg, setLoadedMsg] = useState('');
    const [cborAnnoHex, setCborAnnoHex] = useState('');
    const [cborHex, setCborHex] = useState('');
    const [msgFormat, setMsgFormat] = useState<Option | null>(null);
    const [convertTo, setConvertTo] = useState<Option | null>({'label': 'cbor', 'value' : 'cbor'});
    const [decodeMsg, setDecodeMsg] = useState<Option | null>(null);
    const [decodeSchemaTypes, setDecodeSchemaTypes] = useState<{
        all: string[],
        exports: string[]
    }>({
        all: [],
        exports: []
    });

    const meta_title = useSelector(getPageTitle) + ' | Data Translation';
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    const formId = "validation_form";  
    
    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch]);

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsLoading(false);
        setSelectedSchemaFile(null);
        setLoadedSchema(null);
        setSelectedMsgFile('');
        setLoadedMsg('');
        setCborAnnoHex('');
        setCborHex('');
        setMsgFormat(null);
        setConvertTo(null);
        setDecodeMsg(null);
        setDecodeSchemaTypes({
            all: [],
            exports: []
        });
        dispatch(setSchema(null));
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setIsDataValid(false);

        if (loadedSchema && loadedMsg && msgFormat && decodeMsg) {
            try {
                dispatch(validateMessage(loadedSchema, loadedMsg, msgFormat.value, decodeMsg.value))
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
            if (!loadedMsg) {
                err += ', data';
            }
            if (!msgFormat) {
                err += ', data format';
            }
            if (!decodeMsg) {
                err += ', data type';
            }
            sbToastError('ERROR: Validation failed - Please select ' + err)
            setIsLoading(false);
        }
    } 

    const onTranslateClick = (e: React.MouseEvent<HTMLButtonElement>)  => {
        e.preventDefault();
        setIsTranslating(true);

        try {
            dispatch(convertData(loadedMsg, LANG_JSON, LANG_ANNOTATED_HEX))
                .then((rsp: any) => {
                    setIsTranslating(false);
                    sbToastSuccess("Translation complete");

                    if(rsp.payload.data.cbor_annotated_hex) {
                        setCborAnnoHex(rsp.payload.data.cbor_annotated_hex)
                    }

                    if(rsp.payload.data.cbor_hex) {
                        setCborHex(rsp.payload.data.cbor_hex)
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
                                                decodeMsg={decodeMsg} setDecodeMsg={setDecodeMsg}
                                                setDecodeSchemaTypes={setDecodeSchemaTypes}
                                                showCopy={false}
                                                showEditor={false}
                                                showFormatter={false}
                                                showSave={false}
                                                showToast={false} />
                                        </div>
                                        <div className='mt-2'>
                                            <DataTranslated
                                                selectedFile={selectedMsgFile} setSelectedFile={setSelectedMsgFile}
                                                loadedMsg={loadedMsg} setLoadedMsg={setLoadedMsg}
                                                setCborAnnoHex={setCborAnnoHex}
                                                setCborHex={setCborHex}
                                                msgFormat={msgFormat} setMsgFormat={setMsgFormat}
                                                decodeMsg={decodeMsg} setDecodeMsg={setDecodeMsg}
                                                decodeSchemaTypes={decodeSchemaTypes}
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
                                                            data={['cbor']}
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

                                                <div className="card mb-2">
                                                    <div className="card-header p-2">
                                                        CBOR Hex
                                                    </div>
                                                    <div className="card-body p-0 m-0">
                                                        <SBEditor id='cborRawView' data={cborHex} convertTo={''} isReadOnly={'true'} onChange={''} height={'15vh'}></SBEditor> 
                                                    </div>
                                                </div>

                                                <div className="card">
                                                    <div className="card-header p-2">
                                                        CBOR Annotated Hex
                                                    </div>
                                                    <div className="card-body p-0 m-0">
                                                        <SBEditor id='annotatedHexView' data={cborAnnoHex} convertTo={''} isReadOnly={'true'} onChange={''} height={'49vh'}></SBEditor> 
                                                    </div>
                                                </div>

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