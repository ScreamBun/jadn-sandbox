import { convertSchema, info } from 'actions/convert'
import { validateSchema } from 'actions/validate'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { Form, Button } from 'reactstrap'
import ConvertedSchema from './ConvertedSchema'
import LoadedSchema from './LoadedSchema'


const Converter = () => {
    const [selectedFile, setSelectedFile] = useState('');
    const [loadedSchema, setLoadedSchema] = useState({ placeholder: 'Paste JADN schema here' });
    const [convertedSchema, setConvertedSchema] = useState('');
    const [conversion, setConversion] = useState('');

    // Populate schema and conversions from server
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    // If selected file is changed, remove converted schema
    useEffect(() => {
        setConvertedSchema('');
    }, [selectedFile])

    const reset = (e: React.MouseEvent<HTMLButtonElement>) => {
        setLoadedSchema({ placeholder: 'Paste JADN schema here' });
        setConvertedSchema('');
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (conversion) {
            let schemaObj = loadedSchema;

            // validate schema
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
                            // If valid schema and conversion is set, convert schema
                            if (validateSchemaVal.payload.valid_bool == true && conversion) {
                                try {
                                    dispatch(convertSchema(schemaObj, conversion, 'all')) // TODO: see usage of comments in converter.py
                                        .then((convertSchemaVal) => {
                                            setConvertedSchema(convertSchemaVal.payload.schema.convert);
                                            toast(`Schema converted to ${conversion} successfully`, { type: toast.TYPE.INFO });
                                        })
                                        .catch((_convertSchemaErr) => {
                                            setConvertedSchema("File conversion failed");
                                            toast(`Schema conversion to ${conversion} failed`, { type: toast.TYPE.WARNING });
                                        })

                                } catch (err) {
                                    if (err instanceof Error) {
                                        setConvertedSchema(`File conversion failed`);
                                        toast(`${err.message}`, { type: toast.TYPE.WARNING });
                                    }
                                }
                            } else if (validateSchemaVal.payload.valid_bool == false) {
                                toast(`Invalid Schema`, { type: toast.TYPE.WARNING });
                            } else if (conversion == ''){
                                toast(`No Conversion Selected`, { type: toast.TYPE.WARNING });
                            }
                        })
                    .catch((validateSchemaErr) => {
                        toast(`${validateSchemaErr}`, { type: toast.TYPE.WARNING });
                    })

            } catch (err) {
                if (err instanceof Error) {
                    toast(`${err.message}`, { type: toast.TYPE.WARNING });
                }
            }
        } else {
            toast(`No language selected for conversion`, { type: toast.TYPE.WARNING })
        }
    }

    return (
        <div className='row mx-auto'>
            <Form className="mx-auto col-12" onSubmit={submitForm}>
                <div className="form-row">
                    <LoadedSchema selectedFile={selectedFile} setSelectedFile={setSelectedFile} loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema} />
                    <ConvertedSchema convertedSchema={convertedSchema} setConvertedSchema={setConvertedSchema} conversion={conversion} setConversion={setConversion} loadedSchema={loadedSchema} />
                </div>
                <Button color="danger" className='float-right mt-2' type="reset" onClick={reset}>Reset</Button>
            </Form>
        </div>
    );
}

export default Converter