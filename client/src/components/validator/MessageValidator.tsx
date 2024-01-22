import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import MessageValidated from './MessageValidated'
import { validateMessage } from 'actions/validate'
import { info, setSchema } from 'actions/util'
import { getPageTitle } from 'reducers/util'
import SchemaLoader from 'components/common/SchemaLoader'
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast'
import { Option } from 'components/common/SBSelect'


const MessageValidator = () => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [selectedSchemaFile, setSelectedSchemaFile] = useState<Option | null>(null);
    const [schemaFormat, setSchemaFormat] = useState<Option | null>(null);
    const [loadedSchema, setLoadedSchema] = useState<object | null>(null);
    const [selectedMsgFile, setSelectedMsgFile] = useState('');
    const [loadedMsg, setLoadedMsg] = useState('');
    const [msgFormat, setMsgFormat] = useState<Option | null>(null);
    const [decodeMsg, setDecodeMsg] = useState<Option | null>(null);
    const [decodeSchemaTypes, setDecodeSchemaTypes] = useState<{
        all: string[],
        exports: string[]
    }>({
        all: [],
        exports: []
    });

    const meta_title = useSelector(getPageTitle) + ' | Data Validation';
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    const formId = "validation_form";

    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsLoading(false);
        setSelectedSchemaFile(null);
        setLoadedSchema(null);
        setSelectedMsgFile('');
        setLoadedMsg('');
        setMsgFormat(null);
        setDecodeMsg(null);
        setDecodeSchemaTypes({
            all: [],
            exports: []
        });
        dispatch(setSchema(null));
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
                err += ', data';
            }
            if (!msgFormat) {
                err += ', data format';
            }
            if (!decodeMsg) {
                err += ', data type';
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
                        <div className='card-header bg-secondary p-2'>
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Data Validation</span></h5>
                            <button type='reset' className='btn btn-sm btn-danger float-end' onClick={onReset}>Reset</button>
                        </div>
                        <div className='card-body p-2'>
                            <form id={formId} onSubmit={submitForm}>
                                <div className='row'>
                                    <div className='col-md-6 pr-1'>
                                        <SchemaLoader
                                            selectedFile={selectedSchemaFile} setSelectedFile={setSelectedSchemaFile}
                                            schemaFormat={schemaFormat} setSchemaFormat={setSchemaFormat}
                                            loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema}
                                            decodeMsg={decodeMsg} setDecodeMsg={setDecodeMsg}
                                            setDecodeSchemaTypes={setDecodeSchemaTypes} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <MessageValidated
                                            selectedFile={selectedMsgFile} setSelectedFile={setSelectedMsgFile}
                                            loadedMsg={loadedMsg} setLoadedMsg={setLoadedMsg}
                                            msgFormat={msgFormat} setMsgFormat={setMsgFormat}
                                            decodeMsg={decodeMsg} setDecodeMsg={setDecodeMsg}
                                            decodeSchemaTypes={decodeSchemaTypes}
                                            isLoading={isLoading} formId={formId}
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
