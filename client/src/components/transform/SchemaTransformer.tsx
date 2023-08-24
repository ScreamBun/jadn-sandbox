import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button } from 'reactstrap'
import { getPageTitle } from 'reducers/util'
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast'
import SchemaTransformed from './SchemaTransformed'
import SBMultiSchemaLoader from 'components/common/SBMultiSchemaLoader'
import { info, transformSchema } from 'actions/transform'
import { Option } from 'components/common/SBSelect'

export const initTransformedSchema = {
    schema: '',
    schema_name: ''
}

const SchemaTransformer = () => {
    const dispatch = useDispatch();

    const [selectedFiles, setSelectedFiles] = useState<any[]>([]); //arr of obj: [{name of schema, schema data},...]
    const [selectedFileOpts, setSelectedFileOpts] = useState<Option[]>([]);
    const [transformationType, setTransformationType] = useState<Option | null>();
    const [baseFile, setBaseFile] = useState<Option | null>();
    const [transformedSchema, setTransformedSchema] = useState([initTransformedSchema]);
    const [isLoading, setIsLoading] = useState(false);

    const meta_title = useSelector(getPageTitle) + ' | Schema Transformation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;

    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch])

    useEffect(() => {
        setTransformedSchema([initTransformedSchema]);
        setBaseFile(null);
    }, [selectedFiles])

    const onReset = () => {
        setIsLoading(false);
        setBaseFile(null);
        setTransformationType(null);
        setSelectedFiles([]);
        setSelectedFileOpts([]);
        setTransformedSchema([initTransformedSchema]);
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        if (transformationType?.value) {
            const selectedBasefile = baseFile?.value ? baseFile.value : '';
            dispatch(transformSchema(selectedFiles, transformationType.value, selectedBasefile))
                .then((val) => {
                    if (val.error == true) {
                        setIsLoading(false);
                        let invalid_schema_list: any[] = [];
                        if (typeof val.payload.response == "object") {
                            val.payload.response.forEach((schema) => {
                                sbToastError(`${schema.name} : ${schema.err}`);
                                invalid_schema_list.push(schema.name);
                            })
                            //invalidate selectedFiles 
                            const invalidFiles = selectedFiles.map((f) => {
                                if (invalid_schema_list.includes(f.name)) {
                                    return { ...f, 'data': 'err' };
                                } else {
                                    return f;
                                }
                            })
                            setSelectedFiles(invalidFiles);

                        } else {
                            setIsLoading(false);
                            sbToastError(val.payload.response);
                        }
                    } else {
                        setIsLoading(false);
                        sbToastSuccess('Transformed Schema successfully');
                        setTransformedSchema(val.payload);
                    }
                })
                .catch((err) => {
                    setIsLoading(false);
                    sbToastError(err);
                })
        } else {
            setIsLoading(false);
            sbToastError('No Transformation type selected');
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
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Schema Transformation</span></h5>
                            <Button color="danger" className='float-right btn-sm' type="reset" onClick={onReset}>Reset</Button>
                        </div>
                        <div className='card-body p-2'>
                            <Form onSubmit={submitForm}>
                                <div className='row'>
                                    <div className='col-md-6 pr-1'>
                                        <SBMultiSchemaLoader data={selectedFiles} setData={setSelectedFiles}
                                            selectedFileOpts={selectedFileOpts} setSelectedFileOpts={setSelectedFileOpts} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <SchemaTransformed transformedSchema={transformedSchema} data={selectedFiles}
                                            transformationType={transformationType} setTransformationType={setTransformationType}
                                            setTransformedSchema={setTransformedSchema}
                                            isLoading={isLoading} baseFile={baseFile} setBaseFile={setBaseFile} selectedFiles={selectedFiles}
                                        />
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

export default SchemaTransformer