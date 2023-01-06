import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { Button } from 'reactstrap'
import MessageCreator from './MessageCreator'
import MessageSchema from './MessageSchema'
import { getPageTitle } from 'reducers/util'
import { info } from 'actions/generate'


const MessageGenerator = () => {
    const dispatch = useDispatch()

    //state 
    const [selectedFile, setSelectedFile] = useState('');
    const [loadedSchema, setLoadedSchema] = useState({ placeholder: 'Paste JADN schema here' });
    const [message, setMessage] = useState({});

    //add meta data for page 
    const meta_title = useSelector(getPageTitle) + ' | Generate Message'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;

    //populate meta and schema from server
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelectedFile('');
        setLoadedSchema({ placeholder: 'Paste JADN schema here' });
        setMessage({});
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
                            <h5 className='m-0'> Generate Message</h5>
                        </div>
                        <div className='card-body p-2'>
                            <div className='row'>
                                <div className='col-md-6 pr-1'>
                                    <MessageSchema
                                        selectedFile={selectedFile} setSelectedFile={setSelectedFile}
                                        loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema} />
                                </div>
                                <div className='col-md-6 pl-1'>
                                    <MessageCreator
                                        selectedSchema={loadedSchema}
                                        message={message} setMessage={setMessage} />
                                </div>
                            </div>
                        </div>
                        <div className='card-footer p-2'>
                            <Button color="danger" className='float-right ml-1' type="reset" onClick={onReset}>Reset</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default MessageGenerator 