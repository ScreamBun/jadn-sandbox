import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import DataCreator from './DataCreator'
import SchemaLoader from 'components/common/SchemaLoader'
import { getPageTitle } from 'reducers/util'
import { info, setSchema } from 'actions/util'
import { dismissAllToast } from 'components/common/SBToast'
import { sbToastSuccess, sbToastError } from 'components/common/SBToast'
import { Option } from 'components/common/SBSelect'

const DataGenerator = () => {
    const dispatch = useDispatch()

    const [selectedFile, setSelectedFile] = useState<Option | null>(null);
    const [schemaFormat, setSchemaFormat] = useState<Option | null>(null);
    const [loadedSchema, setLoadedSchema] = useState<object | null>(null);
    const [generatedMessage, setGeneratedMessage] = useState({});
    const [selection, setSelection] = useState<Option | null>();

    const meta_title = useSelector(getPageTitle) + ' | Data Creation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`

    const [activeView, setActiveView] = useState('message');

    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch])

    useEffect(() => {
        setSelection(null);
        setGeneratedMessage({});
        dispatch(setSchema(loadedSchema));
    }, [loadedSchema])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setSelectedFile(null);
        setLoadedSchema(null);
        setSelection(null);
        setGeneratedMessage({});
        setActiveView('message');
        sbToastSuccess("Schema reset successfully");
        dispatch(setSchema(null));
    }

    const viewEditor = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (selectedFile == null || loadedSchema == null) {
            sbToastError("Load a schema before switching to editor view.");
            return;
        }
        setActiveView('creator');
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
                        <div className='card-header bg-secondary p-2'>
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Data Creation</span></h5>
                            <button type='button' onClick={() => setActiveView('message')} className={`btn btn-sm btn-warning float-end ms-1 ${activeView == 'message' ? ' d-none' : ''}`} >View Schema</button>
                            <button type='button' onClick={viewEditor} className={`btn btn-sm btn-warning float-end ms-1 ${activeView == 'creator' ? ' d-none' : ''}`} >View Editor</button>
                            <button type='reset' className='btn btn-sm btn-danger float-end ms-1' onClick={onReset}>Reset</button>
                        </div>
                        <div className='card-body p-2'>
                            <div className='row no-gutters'>
                                <div className='col-md-12 pr-2'>
                                    <div className="tab-pane fade show active" id="message" role="tabpanel" aria-labelledby="message-tab" tabIndex={0}
                                        style={{display: activeView === 'message' ? 'block' : 'none'}}>
                                        <SchemaLoader
                                            selectedFile={selectedFile} setSelectedFile={setSelectedFile}
                                            schemaFormat={schemaFormat} setSchemaFormat={setSchemaFormat}
                                            loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema} />
                                    </div>
                                    <div className="tab-pane fade show active" id="creator" role="tabpanel" aria-labelledby="creator-tab" tabIndex={0}
                                        style={{display: activeView === 'creator' ? 'block' : 'none'}}>
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
        </div>
    );
}
export default DataGenerator