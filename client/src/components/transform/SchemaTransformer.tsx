import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button } from 'reactstrap'
import { getPageTitle } from 'reducers/util'
import { sbToastError, sbToastSuccess } from 'components/common/SBToast'
import SchemaTransformed from './SchemaTransformed'
import SBMultiSchemaLoader from 'components/common/SBMultiSchemaLoader'
import { transformSchema } from 'actions/transform'

const SchemaTransformer = () => {
    const dispatch = useDispatch();

    const [selectedFiles, setSelectedFiles] = useState<any[]>([]); //arr of obj: {name of schema, schema data}
    const [transformedSchema, setTransformedSchema] = useState('');

    const meta_title = useSelector(getPageTitle) + ' | Schema Transformation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;

    useEffect(() => {
        setTransformedSchema('');
    }, [selectedFiles])

    const onReset = () => {
        setSelectedFiles([]);
        setTransformedSchema('');
        //clear checkboxes 
        var inputElem = document.getElementsByTagName('input');
        for (var i = 0; i < inputElem.length; i++) {
            if (inputElem[i].type == 'checkbox') {
                if (inputElem[i].name == 'schema-files') {
                    inputElem[i].checked = false;
                }
            }
        }
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        //validate all selected files
        //call resolve_references.py
        //set transformed Schema
        dispatch(transformSchema(selectedFiles))
            .then((val) => {
                if (val.error == true) {
                    val.payload.response.forEach((schema) => {
                        sbToastError(`${schema.name} : ${schema.err}`);
                        //invalidate selectedFiles 
                        let invalidFiles;
                        selectedFiles.forEach((file, index) => {
                            if (file.name == schema.name) {
                                invalidFiles = selectedFiles.map((f, i) => {
                                    if (i == index) {
                                        return { ...f, 'data': 'err' };
                                    } else {
                                        return f;
                                    }
                                })
                                setSelectedFiles(invalidFiles);
                            }
                        })
                    })
                } else {
                    sbToastSuccess('Transformed Schema successfully');
                    setTransformedSchema(val.payload);
                }
            })
            .catch((err) => {
                sbToastError(err);
            })
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
                                        <SBMultiSchemaLoader data={selectedFiles} setData={setSelectedFiles} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <SchemaTransformed transformedSchema={transformedSchema} data={selectedFiles} />
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