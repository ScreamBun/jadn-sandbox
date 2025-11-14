import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getPageTitle, getSelectedFile, getSelectedSchema } from 'reducers/util'
import { convertSchema, info } from 'actions/convert'
import { setFile, setSchema, setSchemaValid } from 'actions/util'
import { SchemaJADN } from 'components/create/schema/interface'
import SchemaLoader from 'components/common/SchemaLoader'
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast'
import { initConvertedSchemaState } from 'components/visualize/SchemaVisualizer'
import { Option } from 'components/common/SBSelect'
import SchemaTranslated from './SchemaTranslated'


const SchemaTranslator = () => {
    const dispatch = useDispatch();

    const loadedSchema = useSelector(getSelectedSchema);
    const setLoadedSchema = (schema: object | null) => {
        dispatch(setSchema(schema) as any);
    }

    const selectedFile = useSelector(getSelectedFile);
    const setSelectedFile = (file: Option | null) => {
        dispatch(setFile(file) as any);
    }

    const [schemaFormat, setSchemaFormat] = useState<Option | null>(null);
    const [translation, setTranslation] = useState<Option[]>([]);
    const [translatedSchema, setTranslatedSchema] = useState(initConvertedSchemaState);
    const [isLoading, setIsLoading] = useState(false);

    const meta_title = useSelector(getPageTitle) + ' | Schema Translation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    const formId = "translation_form";

    useEffect(() => {
        dispatch(info() as any);
        dismissAllToast();
    }, [dispatch])

    useEffect(() => {
        setTranslatedSchema(initConvertedSchemaState);
        setTranslation([]);
    }, [loadedSchema, schemaFormat])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsLoading(false);
        setSelectedFile(null);
        setLoadedSchema(null);
        setTranslation([]);
        setSchemaFormat(null);
        setTranslatedSchema(initConvertedSchemaState);
        dispatch(setSchema(null) as any);
        dispatch(setSchemaValid(false) as any)
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        if (translation) {
            let schemaObj: SchemaJADN = loadedSchema as SchemaJADN;

            const arr = translation.map(obj => obj.value.toLowerCase());
            dispatch(convertSchema(schemaObj, schemaFormat?.value.toLowerCase() || '', arr, []) as any)
                .then((convertSchemaVal: any) => {
                    if (convertSchemaVal.error) {
                        setIsLoading(false);
                        setTranslatedSchema(initConvertedSchemaState);
                        sbToastError(convertSchemaVal.payload.response);
                        return;
                    }
                    setIsLoading(false);
                    setTranslatedSchema(convertSchemaVal.payload.schema.convert);
                    const convertedArr = convertSchemaVal.payload.schema.convert.map((obj: any) => obj.fmt_ext);
                    for (let i = 0; i < arr.length; i++) {
                        if (convertedArr.includes(arr[i])) {
                            if (convertSchemaVal.payload.schema.convert[i].err == false) {
                                sbToastSuccess(`Schema translated to ${convertSchemaVal.payload.schema.convert[i].fmt} successfully`);
                            } else {
                                sbToastError(`Schema failed to translate to ${convertSchemaVal.payload.schema.convert[i].fmt} ${convertSchemaVal.payload.schema.convert[i].schema ? `: ${convertSchemaVal.payload.schema.convert[i].schema}` : ''}`);
                            }
                        } else {
                            sbToastError(`Failed to translate to ${translation[i].label}`);
                        }
                    }
                })
                .catch((convertSchemaErr: string) => {
                    setTranslatedSchema(initConvertedSchemaState);
                    setIsLoading(false);
                    sbToastError(convertSchemaErr);
                })
        } else {
            setTranslatedSchema(initConvertedSchemaState);
            setIsLoading(false);
            sbToastError("No language selected for translation");
        }
    }

    return (
        <div>
            <title>{meta_title}</title>
            <link rel="canonical" href={meta_canonical} />
            <div className='row'>
                <div className='col-md-12'>
                    <div className='card'>
                        <div className='card-header bg-secondary p-2'>
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Schema Translation</span></h5>
                            <button type='reset' className='btn btn-sm btn-danger float-end' onClick={onReset}>Reset</button>
                        </div>
                        <div className='card-body p-2'>
                            <form id={formId} onSubmit={submitForm}>
                                <div className='row'>
                                    <div className='col-md-6 pr-1'>
                                        <SchemaLoader
                                            selectedFile={selectedFile} setSelectedFile={setSelectedFile}
                                            schemaFormat={schemaFormat} setSchemaFormat={setSchemaFormat}
                                            loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema} acceptFormat={['.jadn','.jidl','.json']} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <SchemaTranslated
                                            formId={formId}
                                            translatedSchema={translatedSchema} setTranslatedSchema={setTranslatedSchema}
                                            translation={translation} setTranslation={setTranslation}
                                            setSchemaFormat={setSchemaFormat}
                                            isLoading={isLoading} ext={schemaFormat?.value} />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SchemaTranslator