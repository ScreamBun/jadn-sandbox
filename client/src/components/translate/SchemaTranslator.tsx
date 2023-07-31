import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button } from 'reactstrap'
import { getPageTitle } from 'reducers/util'
import { convertSchema, convertToAll, info } from 'actions/convert'
import { validateSchema } from 'actions/validate'
import JADNSchemaLoader from 'components/common/JADNSchemaLoader'
import { sbToastError, sbToastSuccess } from 'components/common/SBToast'
import SchemaTranslated from './SchemaTranslated'

const SchemaTranslator = () => {
    const dispatch = useDispatch();

    const [selectedFile, setSelectedFile] = useState('');
    const [loadedSchema, setLoadedSchema] = useState('');
    const [translatedSchema, setTranslatedSchema] = useState('');
    const [convertAll, setConvertAll] = useState<any[]>([]);
    const [translation, setTranslation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const meta_title = useSelector(getPageTitle) + ' | Schema Translation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    useEffect(() => {
        setTranslatedSchema('');
        setConvertAll([]);
    }, [loadedSchema])

    const onReset = () => {
        setSelectedFile('');
        setLoadedSchema('');
        setTranslation('');
        setConvertAll([]);
        setTranslatedSchema('');
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        if (translation) {
            let schemaObj = loadedSchema;

            if (typeof schemaObj == 'string') {
                try {
                    schemaObj = JSON.parse(loadedSchema);
                } catch (err) {
                    if (err instanceof Error) {
                        sbToastError(err.message);
                        setIsLoading(false);
                    }
                }
            }
            dispatch(validateSchema(schemaObj))
                .then((validateSchemaVal) => {
                    if (validateSchemaVal.payload.valid_bool == true && translation != 'all') {
                        dispatch(convertSchema(schemaObj, translation))
                            .then((convertSchemaVal) => {
                                if (convertSchemaVal.error) {
                                    setTranslatedSchema('');
                                    sbToastError(convertSchemaVal.payload.response);
                                    setIsLoading(false);
                                    return;
                                }
                                setTranslatedSchema(convertSchemaVal.payload.schema.convert);
                                sbToastSuccess(`Schema translated to ${translation} successfully`);
                                setIsLoading(false);
                            })
                            .catch((convertSchemaErr) => {
                                sbToastError(convertSchemaErr.payload.response);
                            })

                    } else if (validateSchemaVal.payload.valid_bool == true && translation == 'all') {
                        //dispatch make-all-formats
                        //.then setConvertedSchema([])
                        //conversion check 
                        //.catch
                        dispatch(convertToAll(schemaObj, 'translation'))
                            .then((convertSchemaVal) => {
                                if (convertSchemaVal.error) {
                                    setTranslatedSchema('');
                                    sbToastError(convertSchemaVal.payload.response);
                                    setIsLoading(false);
                                    return;
                                }
                                setConvertAll(convertSchemaVal.payload.schema.convert);
                                for (let i = 0; i < convertSchemaVal.payload.schema.convert.length; i++) {
                                    sbToastSuccess(`Schema translated to ${convertSchemaVal.payload.schema.convert[i].fmt} successfully`);
                                }
                                setIsLoading(false);
                            })
                            .catch((convertSchemaErr: string) => {
                                sbToastError(convertSchemaErr);
                            })

                    } else if (validateSchemaVal.payload.valid_bool == false) {
                        sbToastError("Invalid Schema");
                        setIsLoading(false);
                    } else if (translation == '') {
                        sbToastError("No translation selected");
                        setIsLoading(false);
                    }
                })
                .catch((validateSchemaErr) => {
                    sbToastError(validateSchemaErr);
                    setIsLoading(false);
                })

        } else {
            sbToastError("No language selected for translation");
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
                        <div className='card-header p-2'>
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Schema Translation</span></h5>
                            <Button color="danger" className='float-right btn-sm' type="reset" onClick={onReset}>Reset</Button>
                        </div>
                        <div className='card-body p-2'>
                            <Form onSubmit={submitForm}>
                                <div className='row'>
                                    <div className='col-md-6 pr-1'>
                                        <JADNSchemaLoader
                                            selectedFile={selectedFile} setSelectedFile={setSelectedFile}
                                            setLoadedSchema={setLoadedSchema} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <SchemaTranslated
                                            translatedSchema={translatedSchema} setTranslatedSchema={setTranslatedSchema}
                                            translation={translation} setTranslation={setTranslation}
                                            convertAll={convertAll} setConvertAll={setConvertAll}
                                            loadedSchema={loadedSchema} isLoading={isLoading} />
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SchemaTranslator