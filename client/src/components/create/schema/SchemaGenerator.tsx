import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { Button } from 'reactstrap'
import { getPageTitle } from 'reducers/util'
import { info } from 'actions/util'
import SchemaCreator from './SchemaCreator'


const SchemaGenerator = () => {
    const dispatch = useDispatch();

    const [selectedSchemaFile, setSelectedSchemaFile] = useState('');
    const [generatedSchema, setGeneratedSchema] = useState(
        {
            types: []
        });

    const meta_title = useSelector(getPageTitle) + ' | Schema Generation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelectedSchemaFile('');
        setGeneratedSchema({
            types: []
        });
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
                            <h5 style={{ display: 'inline' }}><span className='align-middle'>Schema Creation</span></h5>
                            <Button color="danger" className='float-right ml-1 btn-sm' type="reset" onClick={onReset}>Reset</Button>
                        </div>
                        <div className='card-body p-2'>
                            <SchemaCreator
                                selectedFile={selectedSchemaFile} setSelectedFile={setSelectedSchemaFile}
                                generatedSchema={generatedSchema} setGeneratedSchema={setGeneratedSchema} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default SchemaGenerator 