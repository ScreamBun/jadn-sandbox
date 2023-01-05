import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { Form, Button } from 'reactstrap'
import { toast } from 'react-toastify'
import { info, validateMessage } from 'actions/validate'
import { getPageTitle } from 'reducers/util'
import LoadValidSchema from './LoadValidSchema'
import ValidateMessage from './ValidateMessage'

const Validator = () => {
    const dispatch = useDispatch();

    //state 
    const [selectedSchemaFile, setSelectedSchemaFile] = useState('');
    const [loadedSchema, setLoadedSchema] = useState({ placeholder: 'Paste JADN schema here' });
    const [selectedMsgFile, setSelectedMsgFile] = useState('');
    const [loadedMsg, setLoadedMsg] = useState('');
    const [msgFormat, setMsgFormat] = useState('');
    const [decodeMsg, setDecodeMsg] = useState('');
    const [decodeSchemaTypes, setDecodeSchemaTypes] = useState({
        all: [],
        exports: []
    });

    //add meta data for page 
    const meta_title = useSelector(getPageTitle) + ' | Validate ';
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
    }, [meta_title])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelectedSchemaFile('');
        setLoadedSchema({ placeholder: 'Paste JADN schema here' });
        setSelectedMsgFile('');
        setLoadedMsg('');
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            dispatch(validateMessage(loadedSchema, loadedMsg, msgFormat, decodeMsg))
                .then((submitVal) => {
                    toast(<p>{submitVal.payload.valid_msg}</p>, { type: toast.TYPE[submitVal.payload.valid_bool ? 'INFO' : 'WARNING'] });
                })
                .catch((submitErr) => {
                    toast(<p>{submitErr}</p>, { type: toast.TYPE.WARNING });
                    return false;
                })
        } catch (err) {
            if (err instanceof Error) {
                toast(<p>{err.message}</p>, { type: toast.TYPE.WARNING });
            }
        }
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
                            <h5 className='m-0'> Validate Message </h5>
                        </div>
                        <div className='card-body p-2'>
                            <Form onSubmit={submitForm}>
                                <div className='row'>
                                    <div className='col-md-6 pr-1'>
                                        <LoadValidSchema
                                            selectedFile={selectedSchemaFile} setSelectedFile={setSelectedSchemaFile}
                                            loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema}
                                            decodeMsg={decodeMsg} setDecodeMsg={setDecodeMsg}
                                            decodeSchemaTypes={decodeSchemaTypes} setDecodeSchemaTypes={setDecodeSchemaTypes} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <ValidateMessage
                                            selectedFile={selectedMsgFile} setSelectedFile={setSelectedMsgFile}
                                            loadedMsg={loadedMsg} setLoadedMsg={setLoadedMsg}
                                            msgFormat={msgFormat} setMsgFormat={setMsgFormat}
                                            decodeMsg={decodeMsg} setDecodeMsg={setDecodeMsg}
                                            decodeSchemaTypes={decodeSchemaTypes}
                                        />
                                    </div>

                                </div>
                            </Form>
                        </div>
                        <div className='card-footer p-2'>
                            <Button color="danger" className='float-right ml-1' type="reset" onClick={onReset}>Reset</Button>
                            <Button color="success" className='float-right mr-1' type="submit" title="Validate the message against the given schema">Validate Message</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );

}
export default Validator
