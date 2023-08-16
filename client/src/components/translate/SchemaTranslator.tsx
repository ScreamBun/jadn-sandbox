import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button } from 'reactstrap'
import { getPageTitle } from 'reducers/util'
import { convertSchema, info } from 'actions/convert'
import { validateSchema } from 'actions/validate'
import JADNSchemaLoader from 'components/common/JADNSchemaLoader'
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast'
import SchemaTranslated from './SchemaTranslated'
import { initConvertedSchemaState } from 'components/visualize/SchemaVisualizer'
import { Option } from 'components/common/SBSelect'

const SchemaTranslator = () => {
    const dispatch = useDispatch();

    const [selectedFile, setSelectedFile] = useState<Option | null>();
    const [loadedSchema, setLoadedSchema] = useState('');
    const [translatedSchema, setTranslatedSchema] = useState(initConvertedSchemaState);
    const [translation, setTranslation] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const meta_title = useSelector(getPageTitle) + ' | Schema Translation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch])

    useEffect(() => {
        setTranslatedSchema(initConvertedSchemaState);
    }, [loadedSchema])

    const onReset = () => {
        setIsLoading(false);
        setSelectedFile(null);
        setLoadedSchema('');
        setTranslation([]);
        setTranslatedSchema(initConvertedSchemaState);
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
                        setIsLoading(false);
                        sbToastError(err.message);
                    }
                }
            }
            dispatch(validateSchema(schemaObj))
                .then((validateSchemaVal) => {
                    if (validateSchemaVal.payload.valid_bool == true) {
                        //convertSchema takes in an array of values
                        const arr = translation.map(obj => obj.value);
                        dispatch(convertSchema(schemaObj, arr))
                            .then((convertSchemaVal) => {
                                if (convertSchemaVal.error) {
                                    setIsLoading(false);
                                    setTranslatedSchema(initConvertedSchemaState);
                                    sbToastError(convertSchemaVal.payload.response);
                                    return;
                                }
                                setIsLoading(false);
                                setTranslatedSchema(convertSchemaVal.payload.schema.convert);
                                const convertedArr = convertSchemaVal.payload.schema.convert.map(obj => obj.fmt_ext);
                                for (let i = 0; i < arr.length; i++) {
                                    if (convertedArr.includes(arr[i])) {
                                        sbToastSuccess(`Schema translated to ${convertSchemaVal.payload.schema.convert[i].fmt} successfully`);
                                    } else {
                                        sbToastError(`Failed to convert to ${translation[i].label}`);
                                    }
                                }
                            })
                            .catch((convertSchemaErr: string) => {
                                setTranslatedSchema(initConvertedSchemaState);
                                setIsLoading(false);
                                sbToastError(convertSchemaErr);
                            })

                    } else if (validateSchemaVal.payload.valid_bool == false) {
                        setTranslatedSchema(initConvertedSchemaState);
                        setIsLoading(false);
                        sbToastError("Invalid Schema");
                    } else if (translation.length == 0) {
                        setTranslatedSchema(initConvertedSchemaState);
                        setIsLoading(false);
                        sbToastError("No translation selected");
                    }
                })
                .catch((validateSchemaErr) => {
                    setTranslatedSchema(initConvertedSchemaState);
                    setIsLoading(false);
                    sbToastError(validateSchemaErr);
                })

        } else {
            setTranslatedSchema(initConvertedSchemaState);
            setIsLoading(false);
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