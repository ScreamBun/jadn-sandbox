import { convertSchema, info } from 'actions/convert'
import { info as getMeta } from 'actions/util'
import { validateSchema } from 'actions/validate'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { Form, Button } from 'reactstrap'
import { getPageTitle } from 'reducers/util'
import ConvertedSchema from './ConvertedSchema'
import LoadedSchema from './LoadedSchema'

const SchemaConverter = () => {
    const [selectedFile, setSelectedFile] = useState('');
    const [loadedSchema, setLoadedSchema] = useState({ placeholder: 'Paste JADN schema here' });
    const [convertedSchema, setConvertedSchema] = useState('');
    const [conversion, setConversion] = useState('');

    //add meta data for page
    const meta_title = useSelector(getPageTitle) + ' | Convert Schema'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(getMeta());
    }, [meta_title])

    //populate schema and conversions from server
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    //if selected file is changed, remove converted schema
    useEffect(() => {
        setConvertedSchema('');
    }, [selectedFile])

    const onReset = () => {
        setLoadedSchema({ placeholder: 'Paste JADN schema here' });
        setConvertedSchema('');
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (conversion) {
            let schemaObj = loadedSchema;

            //validate schema
            if (typeof schemaObj == 'string') {
                try {
                    schemaObj = JSON.parse(loadedSchema);
                } catch (err) {
                    if (err instanceof Error) {
                        toast(<p>{err.message}</p>, { type: toast.TYPE.WARNING });
                    }
                }
            }

            try {
                dispatch(validateSchema(schemaObj))
                    .then(
                        (validateSchemaVal) => {
                            //if valid schema and conversion is set, convert schema
                            if (validateSchemaVal.payload.valid_bool == true && conversion) {
                                try {
                                    dispatch(convertSchema(schemaObj, conversion, 'all')) //TODO: see usage of comments in converter.py
                                        .then((convertSchemaVal) => {
                                            setConvertedSchema(convertSchemaVal.payload.schema.convert);
                                            toast(<p>Schema converted to {conversion} successfully</p>, { type: toast.TYPE.INFO });
                                        })
                                        .catch((_convertSchemaErr) => {
                                            setConvertedSchema("ERROR: File conversion failed");
                                            toast(<p>ERROR: Schema conversion to {conversion} failed</p>, { type: toast.TYPE.WARNING });
                                        })

                                } catch (err) {
                                    if (err instanceof Error) {
                                        setConvertedSchema("ERROR: File conversion failed");
                                        toast(<p>{err.message}</p>, { type: toast.TYPE.WARNING });
                                    }
                                }
                            } else if (validateSchemaVal.payload.valid_bool == false) {
                                toast(<p>ERROR: Invalid Schema</p>, { type: toast.TYPE.WARNING });
                            } else if (conversion == '') {
                                toast(<p>ERROR: No Conversion Selected</p>, { type: toast.TYPE.WARNING });
                            }
                        })
                    .catch((validateSchemaErr) => {
                        toast(<p>{validateSchemaErr}</p>, { type: toast.TYPE.WARNING });
                    })

            } catch (err) {
                if (err instanceof Error) {
                    toast(<p>{err.message}</p>, { type: toast.TYPE.WARNING });
                }
            }
        } else {
            toast(<p>ERROR: No language selected for conversion</p>, { type: toast.TYPE.WARNING })
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
                                        <LoadedSchema selectedFile={selectedFile} setSelectedFile={setSelectedFile} loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema} />
                                    </div>
                                    <div className='col-md-6' pl-1>
                                        <ConvertedSchema convertedSchema={convertedSchema} setConvertedSchema={setConvertedSchema} conversion={conversion} setConversion={setConversion} loadedSchema={loadedSchema} />
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