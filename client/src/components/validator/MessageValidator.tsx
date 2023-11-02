import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import MessageValidated from './MessageValidated'
import { validateMessage } from 'actions/validate'
import { info, setSchema } from 'actions/util'
import { getPageTitle } from 'reducers/util'
import JADNSchemaLoader from 'components/common/JADNSchemaLoader'
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast'
import { Option } from 'components/common/SBSelect'


const MessageValidator = () => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [selectedSchemaFile, setSelectedSchemaFile] = useState<Option | null>();
    const [loadedSchema, setLoadedSchema] = useState<String>('');
    const [selectedMsgFile, setSelectedMsgFile] = useState('');
    const [loadedMsg, setLoadedMsg] = useState('');
    const [msgFormat, setMsgFormat] = useState('');
    const [decodeMsg, setDecodeMsg] = useState('');
    const [decodeSchemaTypes, setDecodeSchemaTypes] = useState({
        all: [],
        exports: []
    });

    const meta_title = useSelector(getPageTitle) + ' | Message Validation';
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;

    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsLoading(false);
        setSelectedSchemaFile(null);
        setLoadedSchema('');
        setSelectedMsgFile('');
        setLoadedMsg('');
        setMsgFormat('');
        setDecodeMsg('');
        setDecodeSchemaTypes({
            all: [],
            exports: []
        });
        dispatch(setSchema(''));
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        if (loadedSchema && loadedMsg && msgFormat && decodeMsg) {
            try {
                dispatch(validateMessage(loadedSchema, loadedMsg, msgFormat.value, decodeMsg.value))
                    .then((submitVal: any) => {
                        if (submitVal && submitVal.payload.valid_bool) {
                            setIsLoading(false);
                            sbToastSuccess(submitVal.payload.valid_msg)
                        } else {
                            if (submitVal.payload.valid_msg.length != 1 && typeof submitVal.payload.valid_msg == 'object') {
                                setIsLoading(false);
                                for (const index in submitVal.payload.valid_msg) {
                                    sbToastError(submitVal.payload.valid_msg[index])
                                }
                            } else {
                                setIsLoading(false);
                                sbToastError(submitVal.payload.valid_msg)
                            }
                        }
                    })
                    .catch((submitErr: { message: string }) => {
                        setIsLoading(false);
                        sbToastError(submitErr.message)
                        return false;
                    })
            } catch (err) {
                if (err instanceof Error) {
                    setIsLoading(false);
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
            setIsLoading(false);
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
                        <div className='card-header bg-primary p-2'>
                            <h5 className='m-0 text-light' style={{ display: 'inline' }}><span className='align-middle'>Message Validation</span></h5>
                            <button type='reset' className='btn btn-sm btn-danger float-end' onClick={onReset}>Reset</button>
                        </div>
                        <div className='card-body p-2'>
                            <form onSubmit={submitForm}>
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
                                            isLoading={isLoading}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default MessageValidator
