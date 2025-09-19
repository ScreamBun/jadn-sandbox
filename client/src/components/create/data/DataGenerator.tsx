import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import DataCreator from './DataCreator'
import SchemaLoader from 'components/common/SchemaLoader'
import { getPageTitle, getSelectedFile, getSelectedSchema } from 'reducers/util'
import { info, setFile, setSchema, setSchemaValid } from 'actions/util'
import { dismissAllToast } from 'components/common/SBToast'
import { sbToastSuccess } from 'components/common/SBToast'
import { Option } from 'components/common/SBSelect'
import { validateField as _validateFieldAction, clearFieldValidation } from 'actions/validatefield';
import { clearHighlight } from "actions/highlight";
import { useNavigate } from 'react-router'

const DataGenerator = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const loadedSchema = useSelector(getSelectedSchema);
    const setLoadedSchema = (schema: object | null) => {
        dispatch(setSchema(schema));
    }

    const selectedFile = useSelector(getSelectedFile);
    const setSelectedFile = (file: Option | null) => {
        dispatch(setFile(file));
    }
    const [generatedMessage, setGeneratedMessage] = useState({});
    const [xml, setXml] = useState('');
    const [cbor, setCbor] = useState('');
    const [selection, setSelection] = useState<Option | null>();
    const [schemaFormat, setSchemaFormat] = useState<Option | null>(null);

    const meta_title = useSelector(getPageTitle) + ' | Data Creation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`

    const handleSchemaCreation = () => {
        navigate('/create/schema');
    }

    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch])

    useEffect(() => {
        setSelection(null);
        setGeneratedMessage({});
        setXml("");
        setCbor("");
        dispatch(setSchema(loadedSchema));
        dispatch(clearFieldValidation());
        dispatch<any>(clearHighlight());
    }, [loadedSchema])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setSelectedFile(null);
        setLoadedSchema(null);
        setXml("");
        setCbor("");
        setSelection(null);
        setGeneratedMessage({});
        sbToastSuccess("Schema reset successfully");
        dispatch(setSchema(null));
        dispatch({ type: 'TOGGLE_DEFAULTS', payload: false });
        dispatch(clearFieldValidation());
        dispatch<any>(clearHighlight());
        dispatch(setSchemaValid(false))
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
                            <div className='col-md-4 min-w-0 p-0'>
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
                            <div className="ms-auto flex-shrink-0" role="group" aria-label="First group">
                                <button type="button" className="btn btn-sm btn-primary me-2" onClick={handleSchemaCreation}>Schema Creation</button>
                                <button type='reset' className='btn btn-sm btn-danger border-0' onClick={onReset}>Reset</button>
                            </div>
                        </div>
                        <div className='card-body p-2'>
                            <div className='row no-gutters'>
                                <div className='col-md-12 pr-2'>
                                    <DataCreator
                                        generatedMessage={generatedMessage} setGeneratedMessage={setGeneratedMessage}
                                        selection={selection} setSelection={setSelection}
                                        xml={xml} setXml={setXml}
                                        cbor={cbor} setCbor={setCbor} />
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