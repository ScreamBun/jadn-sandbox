import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button } from 'reactstrap'
import { getPageTitle } from 'reducers/util'
import { convertSchema, info } from 'actions/convert'
import { validateSchema } from 'actions/validate'
import JADNSchemaLoader from 'components/common/JADNSchemaLoader'
import { sbToastError, sbToastSuccess } from 'components/common/SBToast'
import SchemaTranslated from './SchemaTranslated'

const SchemaTranslator = () => {
    const dispatch = useDispatch();

    const [selectedFile, setSelectedFile] = useState('');
    const [loadedSchema, setLoadedSchema] = useState('');
    const [translatedSchema, setTranslatedSchema] = useState('');
    const [translation, setTranslation] = useState('');

    const meta_title = useSelector(getPageTitle) + ' | Schema Translation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    useEffect(() => {
        setTranslatedSchema('');
    }, [selectedFile])

    const onReset = () => {
        setSelectedFile('');
        setLoadedSchema('');
        setTranslation('');
        setTranslatedSchema('');
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (translation) {
            let schemaObj = loadedSchema;

            if (typeof schemaObj == 'string') {
                try {
                    schemaObj = JSON.parse(loadedSchema);
                } catch (err) {
                    if (err instanceof Error) {
                        sbToastError(err.message);
                    }
                }
            }

            try {
                dispatch(validateSchema(schemaObj))
                    .then((validateSchemaVal) => {
                        if (validateSchemaVal.payload.valid_bool == true && translation) {
                            try {
                                dispatch(convertSchema(schemaObj, translation))
                                    .then((convertSchemaVal) => {
                                        setTranslatedSchema(convertSchemaVal.payload.schema.convert);
                                        const conversionCheck = convertSchemaVal.payload.schema.convert;
                                        if (conversionCheck.startsWith('Error')) {
                                            sbToastError(conversionCheck);
                                        } else {
                                            sbToastSuccess(`Schema translation to ${translation} successfully`);
                                        }
                                    })
                                    .catch((_convertSchemaErr) => {
                                        sbToastError(_convertSchemaErr);
                                    })

                            } catch (err) {
                                if (err instanceof Error) {
                                    sbToastError(err.message);
                                }
                            }
                        } else if (validateSchemaVal.payload.valid_bool == false) {
                            sbToastError("Invalid Schema");
                        } else if (translation == '') {
                            sbToastError("No translation selected");
                        }
                    })
                    .catch((validateSchemaErr) => {
                        sbToastError(validateSchemaErr);
                    })

            } catch (err) {
                if (err instanceof Error) {
                    sbToastError(err.message);
                }
            }
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
                                            loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <SchemaTranslated
                                            translatedSchema={translatedSchema} setTranslatedSchema={setTranslatedSchema}
                                            translation={translation} setTranslation={setTranslation}
                                            loadedSchema={loadedSchema} />
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