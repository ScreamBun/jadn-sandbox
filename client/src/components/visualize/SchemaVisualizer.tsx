import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button } from 'reactstrap'
import { getPageTitle } from 'reducers/util'
import { convertSchema, info } from 'actions/convert'
import { validateSchema } from 'actions/validate'
import JADNSchemaLoader from 'components/common/JADNSchemaLoader'
import { sbToastError, sbToastSuccess } from 'components/common/SBToast'
import SchemaVisualized from './SchemaVisualized'

const SchemaVisualizer = () => {
    const dispatch = useDispatch();

    const [selectedFile, setSelectedFile] = useState('');
    const [loadedSchema, setLoadedSchema] = useState('');
    const [convertedSchema, setConvertedSchema] = useState('');
    const [conversion, setConversion] = useState<any[] | string>('');
    const [spiltViewFlag, setSplitViewFlag] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const meta_title = useSelector(getPageTitle) + ' | Schema Visualization'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    useEffect(() => {
        setConvertedSchema('');
        setSplitViewFlag(false);
    }, [loadedSchema]);

    const onReset = () => {
        setSelectedFile('');
        setLoadedSchema('');
        setConversion('');
        setConvertedSchema('');
        setSplitViewFlag(false);
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        if (conversion) {
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
                    if (validateSchemaVal.payload.valid_bool == true) {
                        dispatch(convertSchema(schemaObj, conversion))
                            .then((convertSchemaVal) => {
                                if (convertSchemaVal.error) {
                                    setConvertedSchema('');
                                    sbToastError(convertSchemaVal.payload.response);
                                    setIsLoading(false);
                                    return;
                                }
                                setConvertedSchema(convertSchemaVal.payload.schema.convert);
                                for (let i = 0; i < convertSchemaVal.payload.schema.convert.length; i++) {
                                    sbToastSuccess(`Schema converted to ${convertSchemaVal.payload.schema.convert[i].fmt} successfully`);
                                }
                                setIsLoading(false);
                            })
                            .catch((convertSchemaErr: string) => {
                                sbToastError(convertSchemaErr);
                                setIsLoading(false);
                            })

                    } else if (validateSchemaVal.payload.valid_bool == false) {
                        sbToastError("Invalid Schema");
                        setIsLoading(false);
                    } else if (conversion == '') {
                        sbToastError("No conversion selected");
                        setIsLoading(false);
                    }
                })
                .catch((validateSchemaErr: string) => {
                    sbToastError(validateSchemaErr);
                    setIsLoading(false);
                })

        } else {
            sbToastError("No language selected for conversion");
            setIsLoading(false);
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
                                            setLoadedSchema={setLoadedSchema} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <SchemaVisualized
                                            convertedSchema={convertedSchema} setConvertedSchema={setConvertedSchema}
                                            conversion={conversion} setConversion={setConversion}
                                            spiltViewFlag={spiltViewFlag} setSplitViewFlag={setSplitViewFlag}
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

export default SchemaVisualizer