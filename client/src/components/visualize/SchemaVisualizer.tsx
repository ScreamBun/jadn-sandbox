import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { getPageTitle } from 'reducers/util'
import { convertSchema, info } from 'actions/convert'
import SchemaLoader from 'components/common/SchemaLoader'
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast'
import { SchemaJADN } from 'components/create/schema/interface'
import SchemaVisualized from './SchemaVisualized'
import { Option } from 'components/common/SBSelect'
import { setSchema } from 'actions/util'

export const initConvertedSchemaState = [{
    schema: '',
    fmt: '',
    fmt_ext: ''
}]

const SchemaVisualizer = () => {
    const dispatch = useDispatch();

    const [selectedFile, setSelectedFile] = useState<Option | null>(null);
    const [schemaFormat, setSchemaFormat] = useState<Option | null>(null);
    const [loadedSchema, setLoadedSchema] = useState<object | null>(null);
    const [conversion, setConversion] = useState<Option[]>([]);
    const [convertedSchema, setConvertedSchema] = useState(initConvertedSchemaState);
    const [isLoading, setIsLoading] = useState(false);
    const [spiltViewFlag, setSplitViewFlag] = useState(false);

    const meta_title = useSelector(getPageTitle) + ' | Schema Visualization'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    const formId = "visualization_form";

    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch])

    useEffect(() => {
        setConvertedSchema(initConvertedSchemaState);
        setSplitViewFlag(false);
    }, [loadedSchema]);

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsLoading(false);
        setSelectedFile(null);
        setLoadedSchema(null);
        setConversion([]);
        setConvertedSchema(initConvertedSchemaState);
        setSplitViewFlag(false);
        dispatch(setSchema(null));
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        if (conversion) {
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
            const arr = conversion.map(obj => obj.value);
            dispatch(convertSchema(schemaObj, schemaFormat?.value, arr))
                .then((convertSchemaVal) => {
                    if (convertSchemaVal.error) {
                        setIsLoading(false);
                        setConvertedSchema(initConvertedSchemaState);
                        sbToastError(convertSchemaVal.payload.response);
                        return;
                    }
                    setIsLoading(false);
                    setConvertedSchema(convertSchemaVal.payload.schema.convert);
                    const convertedArr = convertSchemaVal.payload.schema.convert.map(obj => obj.fmt_ext);
                    for (let i = 0; i < convertSchemaVal.payload.schema.convert.length; i++) {
                        if (convertedArr.includes(arr[i])) {
                            if (convertSchemaVal.payload.schema.convert[i].err == false) {
                                sbToastSuccess(`Schema visualized to ${convertSchemaVal.payload.schema.convert[i].fmt} successfully`);
                            } else {
                                sbToastError(`Schema failed to visualize ${convertSchemaVal.payload.schema.convert[i].fmt} ${convertSchemaVal.payload.schema.convert[i].schema ? `: ${convertSchemaVal.payload.schema.convert[i].schema}` : ''}`);
                            }
                        } else {
                            sbToastError(`Failed to visualize to ${conversion[i].label}`);
                        }
                    }
                })
                .catch((convertSchemaErr: string) => {
                    setIsLoading(false);
                    sbToastError(convertSchemaErr);
                })
        } else {
            setIsLoading(false);
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
                        <div className='card-header bg-secondary p-2'>
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Schema Visualization</span></h5>
                            <button type='reset' className='btn btn-sm btn-danger float-end' onClick={onReset}>Reset</button>
                        </div>
                        <div className='card-body p-2'>
                            <form id={formId} onSubmit={submitForm}>
                                <div className='row'>
                                    <div className='col-md-6 pr-1'>
                                        <SchemaLoader
                                            selectedFile={selectedFile} setSelectedFile={setSelectedFile}
                                            schemaFormat={schemaFormat} setSchemaFormat={setSchemaFormat}
                                            loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <SchemaVisualized
                                            convertedSchema={convertedSchema} setConvertedSchema={setConvertedSchema}
                                            conversion={conversion} setConversion={setConversion}
                                            spiltViewFlag={spiltViewFlag} setSplitViewFlag={setSplitViewFlag}
                                            isLoading={isLoading} formId={formId} />
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

export default SchemaVisualizer