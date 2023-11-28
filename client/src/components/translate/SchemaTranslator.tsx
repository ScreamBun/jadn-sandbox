import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { getPageTitle } from 'reducers/util'
import { convertSchema, info } from 'actions/convert'
import { setSchema } from 'actions/util'
import { SchemaJADN } from 'components/create/schema/interface'
import JADNSchemaLoader from 'components/common/JADNSchemaLoader'
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast'
import { initConvertedSchemaState } from 'components/visualize/SchemaVisualizer'
import { Option } from 'components/common/SBSelect'
import SchemaTranslated from './SchemaTranslated'


const SchemaTranslator = () => {
    const dispatch = useDispatch();

    const [selectedFile, setSelectedFile] = useState<Option | null>();
    const [fileName, setFileName] = useState({
        name: '',
        ext: 'jadn'
    });
    const [loadedSchema, setLoadedSchema] = useState<string>('');
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
        setTranslation([]);
    }, [loadedSchema])

    const onReset = () => {
        setIsLoading(false);
        setSelectedFile(null);
        setLoadedSchema('');
        setTranslation([]);
        setTranslatedSchema(initConvertedSchemaState);
        dispatch(setSchema(null));
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        if (translation) {
            let schemaObj: SchemaJADN | string = loadedSchema;

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
            //convertSchema takes in an array of values
            const arr = translation.map(obj => obj.value);
            dispatch(convertSchema(schemaObj, fileName.ext, arr))
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
                            if (convertSchemaVal.payload.schema.convert[i].err == false) {
                                sbToastSuccess(`Schema translated to ${convertSchemaVal.payload.schema.convert[i].fmt} successfully`);
                            } else {
                                sbToastError(`Schema failed to translate to ${convertSchemaVal.payload.schema.convert[i].fmt} : ${convertSchemaVal.payload.schema.convert[i].schema}`);
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
            <Helmet>
                <title>{meta_title}</title>
                <link rel="canonical" href={meta_canonical} />
            </Helmet>
            <div className='row'>
                <div className='col-md-12'>
                    <div className='card'>
                        <div className='card-header bg-secondary p-2'>
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Schema Translation</span></h5>
                            <button type='reset' className='btn btn-sm btn-danger float-end' onClick={onReset}>Reset</button>
                        </div>
                        <div className='card-body p-2'>
                            <form onSubmit={submitForm}>
                                <div className='row'>
                                    <div className='col-md-6 pr-1'>
                                        <JADNSchemaLoader
                                            selectedFile={selectedFile} setSelectedFile={setSelectedFile}
                                            fileName={fileName} setFileName={setFileName}
                                            loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema} acceptFormat={'.json'} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <SchemaTranslated
                                            translatedSchema={translatedSchema} setTranslatedSchema={setTranslatedSchema}
                                            translation={translation} setTranslation={setTranslation}
                                            isLoading={isLoading} ext={fileName.ext} />
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