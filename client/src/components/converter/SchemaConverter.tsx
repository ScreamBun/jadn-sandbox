import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button } from 'reactstrap'
import ConvertedSchema from './SchemaConverted'
import { getPageTitle } from 'reducers/util'
import { convertSchema, info } from 'actions/convert'
import { validateSchema } from 'actions/validate'
import JADNSchemaLoader from 'components/common/JADNSchemaLoader'
import { sbToastError, sbToastSuccess } from 'components/common/SBToast'

const SchemaConverter = () => {
    const dispatch = useDispatch();

    const [selectedFile, setSelectedFile] = useState('');
    const [loadedSchema, setLoadedSchema] = useState('');
    const [convertedSchema, setConvertedSchema] = useState('');
    const [conversion, setConversion] = useState('');

    //add meta data for page
    const meta_title = useSelector(getPageTitle) + ' | Convert Schema'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;

    //populate meta, schema and conversions from server
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    //if selected file is changed, remove converted schema
    useEffect(() => {
        setConvertedSchema('');
    }, [selectedFile])

    const onReset = () => {
        setSelectedFile('');
        setLoadedSchema('');
        setConversion('');
        setConvertedSchema('');
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (conversion) {
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
                            if (validateSchemaVal.payload.valid_bool == true && conversion) {
                                try {
                                    dispatch(convertSchema(schemaObj, conversion))
                                        .then((convertSchemaVal) => {
                                            setConvertedSchema(convertSchemaVal.payload.schema.convert);
                                            const conversionCheck = convertSchemaVal.payload.schema.convert;
                                            if (conversionCheck.startsWith('Error')) {
                                                sbToastError(conversionCheck);
                                            } else {
                                                sbToastSuccess(`Schema conversion to ${conversion} successfully`);
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
                            } else if (conversion == '') {
                                sbToastError("No conversion selected");
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
            sbToastError("No language selected for conversion");
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
                            <h5 className='m-0'>Convert Schema</h5>
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
                                        <ConvertedSchema
                                            convertedSchema={convertedSchema} setConvertedSchema={setConvertedSchema}
                                            conversion={conversion} setConversion={setConversion}
                                            loadedSchema={loadedSchema} />
                                    </div>
                                </div>
                            </Form>
                        </div>
                        <div className='card-footer p-2'>
                            <Button color="danger" className='float-right' type="reset" onClick={onReset}>Reset</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SchemaConverter