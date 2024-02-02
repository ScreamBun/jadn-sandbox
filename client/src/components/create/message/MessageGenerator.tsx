import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import MessageCreator from './MessageCreator'
import { getPageTitle } from 'reducers/util'
import { info, setSchema } from 'actions/util'
import SchemaLoader from 'components/common/SchemaLoader'
import { dismissAllToast } from 'components/common/SBToast'
import { Option } from 'components/common/SBSelect'


const MessageGenerator = () => {
    const dispatch = useDispatch()

    const [selectedFile, setSelectedFile] = useState<Option | null>(null);
    const [schemaFormat, setSchemaFormat] = useState<Option | null>(null);
    const [loadedSchema, setLoadedSchema] = useState<object | null>(null);
    const [generatedMessage, setGeneratedMessage] = useState({});
    const [commandType, setCommandType] = useState<Option | null>();

    const meta_title = useSelector(getPageTitle) + ' | Data Creation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch])

    useEffect(() => {
        setCommandType(null);
        setGeneratedMessage({});
        dispatch(setSchema(loadedSchema));
    }, [loadedSchema])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setSelectedFile(null);
        setLoadedSchema(null);
        setCommandType(null);
        setGeneratedMessage({});
        dispatch(setSchema(null));
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
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Data Creation</span></h5>
                            <button type='reset' className='btn btn-sm btn-danger float-end ms-1' onClick={onReset}>Reset</button>
                        </div>
                        <div className='card-body p-2'>
                            <div className='row'>
                                <div className='col-md-6 pr-1'>
                                    <SchemaLoader
                                        selectedFile={selectedFile} setSelectedFile={setSelectedFile}
                                        schemaFormat={schemaFormat} setSchemaFormat={setSchemaFormat}
                                        loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema} />
                                </div>
                                <div className='col-md-6 pl-1'>
                                    <MessageCreator
                                        generatedMessage={generatedMessage} setGeneratedMessage={setGeneratedMessage}
                                        commandType={commandType} setCommandType={setCommandType} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default MessageGenerator 