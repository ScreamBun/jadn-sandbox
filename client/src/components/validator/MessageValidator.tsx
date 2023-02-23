import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { Form, Button } from 'reactstrap'
import MessageValidated from './MessageValidated'
import { validateMessage } from 'actions/validate'
import { info } from 'actions/util'
import { getPageTitle } from 'reducers/util'
import JADNSchemaLoader from 'components/common/JADNSchemaLoader'
import { sbToastError, sbToastSuccess } from 'components/common/SBToast'


const MessageValidator = () => {
    const dispatch = useDispatch();

    const [selectedSchemaFile, setSelectedSchemaFile] = useState('');
    const [loadedSchema, setLoadedSchema] = useState('');
    const [selectedMsgFile, setSelectedMsgFile] = useState('');
    const [loadedMsg, setLoadedMsg] = useState('');
    const [msgFormat, setMsgFormat] = useState('');
    const [decodeMsg, setDecodeMsg] = useState('');
    const [decodeSchemaTypes, setDecodeSchemaTypes] = useState({
        all: [],
        exports: []
    });

    const meta_title = useSelector(getPageTitle) + ' | Validate ';
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;

    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelectedSchemaFile('');
        setLoadedSchema('');
        setSelectedMsgFile('');
        setLoadedMsg('');
        setMsgFormat('');
        setDecodeMsg('');
        setDecodeSchemaTypes({
            all: [],
            exports: []
        });
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (loadedSchema && loadedMsg && msgFormat && decodeMsg) {
            try {
                dispatch(validateMessage(loadedSchema, loadedMsg, msgFormat, decodeMsg))
                    .then((submitVal: any) => {
                        if (submitVal && submitVal.payload.valid_bool) {
                            sbToastSuccess(submitVal.payload.valid_msg)
                        } else {
                            sbToastError(submitVal.payload.valid_msg)
                        }
                    })
                    .catch((submitErr) => {
                        sbToastError(submitErr.message)
                        return false;
                    })
            } catch (err) {
                if (err instanceof Error) {
                    sbToastError(err.message)
                }
            }
        } else {
            var err = '';
            if (!loadedSchema) {
                err += ' schema';
            }
            if (!loadedMsg) {
                err += ', message';
            }
            if (!msgFormat) {
                err += ', message format';
            }
            if (!decodeMsg) {
                err += ', message type';
            }
            sbToastError('ERROR: Validation failed - Please select ' + err)
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
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Message Validation</span></h5>
                            <Button color="danger" className='float-right btn-sm' type="reset" onClick={onReset}>Reset</Button>
                        </div>
                        <div className='card-body p-2'>
                            <Form onSubmit={submitForm}>
                                <div className='row'>
                                    <div className='col-md-6 pr-1'>
                                        <JADNSchemaLoader
                                            selectedFile={selectedSchemaFile} setSelectedFile={setSelectedSchemaFile}
                                            loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema}
                                            decodeMsg={decodeMsg} setDecodeMsg={setDecodeMsg}
                                            decodeSchemaTypes={decodeSchemaTypes} setDecodeSchemaTypes={setDecodeSchemaTypes} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <MessageValidated
                                            selectedFile={selectedMsgFile} setSelectedFile={setSelectedMsgFile}
                                            loadedMsg={loadedMsg} setLoadedMsg={setLoadedMsg}
                                            msgFormat={msgFormat} setMsgFormat={setMsgFormat}
                                            decodeMsg={decodeMsg} setDecodeMsg={setDecodeMsg}
                                            decodeSchemaTypes={decodeSchemaTypes}
                                            loadedSchema={loadedSchema}
                                        />
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
export default MessageValidator
