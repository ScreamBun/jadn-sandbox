import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { getPageTitle } from 'reducers/util'
import MessageCreator from './MessageCreator'
import { info } from 'actions/generate'
import MessageSchema from './MessageSchema'

const MessageGenerator = () => {
    const dispatch = useDispatch()

    //state 
    const [selectedFile, setSelectedFile] = useState('');
    const [loadedSchema, setLoadedSchema] = useState({ placeholder: 'Paste JADN schema here' });

    //add meta data for page 
    const meta_title = useSelector(getPageTitle) + ' | Generate Message'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;

    //populate meta and schema from server
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    return (
        <div className='row mx-auto'>
            <Helmet>
                <title>{meta_title}</title>
                <link rel="canonical" href={meta_canonical} />
            </Helmet>
            <MessageSchema selectedFile={selectedFile} setSelectedFile={setSelectedFile} loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema} />
            <MessageCreator selectedSchema={loadedSchema} />
        </div>
    );

}
export default MessageGenerator 