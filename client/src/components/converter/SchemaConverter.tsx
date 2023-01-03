import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { Form, Button } from 'reactstrap'
import ConvertedSchema from './ConvertedSchema'
import LoadedSchema from './LoadedSchema'
import { getPageTitle } from 'reducers/util'
import { convertSchema, info } from 'actions/convert'
import { validateSchema } from 'actions/validate'

const SchemaConverter = () => {
    const dispatch = useDispatch();

    const [selectedFile, setSelectedFile] = useState('');
    const [loadedSchema, setLoadedSchema] = useState({ placeholder: 'Paste JADN schema here' });
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

    const reset = () => {
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
        <div className='row mx-auto'>
            <Helmet>
                <title>{meta_title}</title>
                <link rel="canonical" href={meta_canonical} />
            </Helmet>

            <Form className="mx-auto col-12" onSubmit={submitForm}>
                <div className="form-row">
                    <LoadedSchema selectedFile={selectedFile} setSelectedFile={setSelectedFile} loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema} />
                    <ConvertedSchema convertedSchema={convertedSchema} setConvertedSchema={setConvertedSchema} conversion={conversion} setConversion={setConversion} loadedSchema={loadedSchema} />
                </div>
                <Button color="danger" className='float-right' type="reset" onClick={reset}>Reset</Button>
                <div className="col-12" />
            </Form>
        </div>
    );
}

export default SchemaConverter