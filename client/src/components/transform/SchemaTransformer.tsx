import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button } from 'reactstrap'
import { getPageTitle } from 'reducers/util'
import { info } from 'actions/convert'
import { validateSchema } from 'actions/validate'
import { sbToastError, sbToastSuccess } from 'components/common/SBToast'
import SchemaTransformed from './SchemaTransformed'

const SchemaTransformer = () => {
    const dispatch = useDispatch();

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [transformedSchema, setTransformedSchema] = useState('');

    const meta_title = useSelector(getPageTitle) + ' | Schema Transformation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    const onReset = () => {
        setSelectedFiles([]);
        setTransformedSchema('');
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        //validate all selected files
        //transform files
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
                                        multiple file uploader here...
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