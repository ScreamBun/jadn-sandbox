import { convertSchema, info } from 'actions/convert'
import { validateSchema } from 'actions/validate'
import React, { FormEvent, useEffect, useState } from 'react'
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

    //populate schema and conversions from server
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    //if selected file is changed, remove converted schema
    useEffect(() => {
        setConvertedSchema('');
    }, [selectedFile])

    const reset = (e: any) => {
        e.preventDefault();
        setSelectedFile('');
        setLoadedSchema({ placeholder: 'Paste JADN schema here' });
        setConvertedSchema('');
        setConversion('');
    }

    const submitForm = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (conversion) {
            let schemaObj = loadedSchema;

            //validate schema
            if (typeof schemaObj == 'string') {
                try {
                    schemaObj = JSON.parse(loadedSchema);
                } catch (err) {
                    toast(<p>{err}</p>, { type: toast.TYPE.WARNING });
                }
            }

            try {
                dispatch(validateSchema(schemaObj))
                    .then(
                        (onValidateSuccess) => {
                            //if valid schema and conversion is set, convert schema
                            if (onValidateSuccess.payload.valid_bool == true && conversion) {
                                try {
                                    dispatch(convertSchema(schemaObj, conversion, 'all')) //TODO: see usage of comments in converter.py
                                        .then((onConvertSuccess) => { setConvertedSchema(onConvertSuccess.payload.schema.convert) })
                                        .catch((onConvertFail) => {
                                            setConvertedSchema("ERROR: file cannot be converted")
                                            toast(<p>ERROR: Unable to Convert</p>, { type: toast.TYPE.WARNING })
                                        })

                                } catch (err) {
                                    setConvertedSchema("ERROR: file cannot be converted")
                                    toast(<p>{err}</p>, { type: toast.TYPE.WARNING })
                                }
                            } else if (onValidateSuccess.payload.valid_bool == false) {
                                toast(<p>ERROR: Invalid Schema</p>, { type: toast.TYPE.WARNING })
                            }
                        })
                    .catch((onValidateFail) => {
                        toast(<p>{onValidateFail}</p>, { type: toast.TYPE.WARNING })
                    })

            } catch (err) {
                toast(<p>{err}</p>, { type: toast.TYPE.WARNING });
            }
        } else {
            toast(<p>ERROR: No language selected for conversion</p>, { type: toast.TYPE.WARNING })
        }
    }

    return (
        <div className='row mx-auto'>
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

export default Converter