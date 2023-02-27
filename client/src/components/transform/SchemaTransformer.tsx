import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { Form, Button } from 'reactstrap'
import { getPageTitle } from 'reducers/util'
import { validateSchema } from 'actions/validate'
import { sbToastError, sbToastSuccess } from 'components/common/SBToast'
import SchemaTransformed from './SchemaTransformed'
import SBMultiFileUploader from 'components/common/SBMultiFileUploader'

const SchemaTransformer = () => {

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [transformedSchema, setTransformedSchema] = useState('');

    const meta_title = useSelector(getPageTitle) + ' | Schema Transformation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;

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
                                        <SBMultiFileUploader data={selectedFiles} setData={setSelectedFiles} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <SchemaTransformed transformedSchema={transformedSchema} />
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