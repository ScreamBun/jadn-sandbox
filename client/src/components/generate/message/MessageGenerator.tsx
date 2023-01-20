import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { Button, Form } from 'reactstrap'
import MessageCreator from './MessageCreator'
import { getPageTitle } from 'reducers/util'
import { info, setSchema } from 'actions/util'
import JADNSchemaLoader from 'components/common/JADNSchemaLoader'


const MessageGenerator = () => {
    const dispatch = useDispatch()

    const [selectedFile, setSelectedFile] = useState('');
    const [loadedSchema, setLoadedSchema] = useState('');
    const [message, setMessage] = useState({});

    const meta_title = useSelector(getPageTitle) + ' | Generate Message'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelectedFile('');
        setLoadedSchema('');
        setMessage({});

        dispatch(setSchema({ types: [] }));
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
                            <Form>
                                <div className='row'>
                                    <div className='col-md-6 pr-1'>
                                        <JADNSchemaLoader
                                            selectedFile={selectedFile} setSelectedFile={setSelectedFile}
                                            loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <MessageCreator
                                            message={message} setMessage={setMessage} />
                                    </div>
                                </div>
                            </Form>
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