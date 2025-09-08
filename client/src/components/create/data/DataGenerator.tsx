import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import DataCreator from './DataCreator'
import SchemaLoader from 'components/common/SchemaLoader'
import { getPageTitle } from 'reducers/util'
import { info, setSchema } from 'actions/util'
import { dismissAllToast } from 'components/common/SBToast'
import { sbToastSuccess } from 'components/common/SBToast'
import { Option } from 'components/common/SBSelect'
import { validateField as _validateFieldAction, clearFieldValidation } from 'actions/validatefield';

const DataGenerator = () => {
    const dispatch = useDispatch()

    // See if there is a local storage item piped from create schema
    const pipedSchema = localStorage.getItem('__createdSchema__');
    const pipedFile = localStorage.getItem('__selectedFile__');
    localStorage.removeItem('__createdSchema__');
    localStorage.removeItem('__selectedFile__');

    const [selectedFile, setSelectedFile] = useState<Option | null>(pipedFile !== null ? JSON.parse(pipedFile) : null);
    const [loadedSchema, setLoadedSchema] = useState<object | null>(pipedSchema !== null ? JSON.parse(pipedSchema) : null); // check for piped schema
    const [generatedMessage, setGeneratedMessage] = useState({});
    const [selection, setSelection] = useState<Option | null>();
    const [schemaFormat, setSchemaFormat] = useState<Option | null>(null);

    const meta_title = useSelector(getPageTitle) + ' | Data Creation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`

    const handleSchemaCreation = () => {
        if (loadedSchema) {
            localStorage.setItem('__createdSchema__', JSON.stringify(loadedSchema));
        }
        if (selectedFile) {
            localStorage.setItem('__selectedFile__', JSON.stringify(selectedFile));
        }
        window.location.href = '/create/schema';
    }

    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch])

    useEffect(() => {
        setSelection(null);
        setGeneratedMessage({});
        dispatch(setSchema(loadedSchema));
        dispatch(clearFieldValidation());
    }, [loadedSchema])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setSelectedFile(null);
        setLoadedSchema(null);
        setSelection(null);
        setGeneratedMessage({});
        sbToastSuccess("Schema reset successfully");
        dispatch(setSchema(null));
        dispatch({ type: 'TOGGLE_DEFAULTS', payload: false });
        dispatch(clearFieldValidation());
    }

    return (
        <div>
            <Helmet>
                <title>{meta_title}</title>
                <link rel="canonical" href={meta_canonical} />
            </Helmet>
            <div className = 'row'>
                <div className='col-md-12'>
                    <div className = 'card'>
                        <div className='card-header bg-secondary p-2 d-flex align-items-center flex-nowrap gap-2'>
                            <h5 className='m-0 me-2 ms-2 flex-shrink-0' style={{ display: 'inline' }}>
                                <span className='align-middle'>Data Creation</span>
                            </h5>
                            <div className='col-md-8 min-w-0'>
                                <SchemaLoader
                                    selectedFile={selectedFile}
                                    setSelectedFile={setSelectedFile}
                                    loadedSchema={loadedSchema}
                                    setLoadedSchema={setLoadedSchema}
                                    schemaFormat={schemaFormat}
                                    setSchemaFormat={setSchemaFormat}
                                    showEditor={false}
                                    showCopy={false}
                                    showFormatter={false}
                                    showSave={false}
                                    lightBackground={true}
                                />
                            </div>
                            <div className="btn-group ms-auto flex-shrink-0" role="group" aria-label="First group">
                                <button type="button" className="btn btn-sm btn-primary me-2" onClick={handleSchemaCreation}>Schema Creation</button>
                                <button type='reset' className='btn btn-sm btn-danger' onClick={onReset}>Reset</button>
                            </div>
                        </div>
                        <div className='card-body p-2'>
                            <div className='row no-gutters'>
                                <div className='col-md-12 pr-2'>
                                    <DataCreator
                                        generatedMessage={generatedMessage} setGeneratedMessage={setGeneratedMessage}
                                        selection={selection} setSelection={setSelection} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default DataGenerator