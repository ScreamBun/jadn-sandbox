import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button } from 'reactstrap'
import SchemaConverted from './SchemaConverted'
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
    const [spiltViewFlag, setSplitViewFlag] = useState(false);

    const meta_title = useSelector(getPageTitle) + ' | Convert Schema'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    useEffect(() => {
        setConvertedSchema('');
        setSplitViewFlag(false);
    }, [selectedFile]);

    const onReset = () => {
        setSelectedFile('');
        setLoadedSchema('');
        setConversion('');
        setConvertedSchema('');
        setSplitViewFlag(false);
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

                        //create ability to convert schema into all formats
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
                                    .catch((convertSchemaErr: string) => {
                                        sbToastError(convertSchemaErr);
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
                    .catch((validateSchemaErr: string) => {
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
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Schema Visualization</span></h5>
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
                                        <SchemaConverted
                                            convertedSchema={convertedSchema} setConvertedSchema={setConvertedSchema}
                                            conversion={conversion} setConversion={setConversion}
                                            spiltViewFlag={spiltViewFlag} setSplitViewFlag={setSplitViewFlag}
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

export default SchemaConverter