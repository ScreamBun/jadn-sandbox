import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "reactstrap";
import {
    escaped2cbor, format, hexify
} from '../utils';
import { loadFile } from "actions/util";
import { getMsgFiles, getSelectedSchema, getValidMsgTypes } from "reducers/util";
import { sbToastError } from "components/common/SBToast";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import { useLocation } from "react-router-dom";
import SBFileUploader from "components/common/SBFileUploader";
import SBSpinner from "components/common/SBSpinner";
import SBSaveFile from "components/common/SBSaveFile";
import SBSelect, { Option } from "components/common/SBSelect";
import { getFilenameExt, getFilenameOnly } from "components/utils/general";

const MessageValidated = (props: any) => {
    const location = useLocation();

    const { selectedFile, setSelectedFile, loadedMsg, setLoadedMsg, msgFormat, setMsgFormat, decodeSchemaTypes, decodeMsg, setDecodeMsg, isLoading } = props;
    const validSchema = useSelector(getSelectedSchema);
    const [fileName, setFileName] = useState('');
    const msgOpts = useSelector(getMsgFiles);
    const validMsgFormat = useSelector(getValidMsgTypes)
    const dispatch = useDispatch();
    const ref = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (location.state) {
            const index = Object.values(validMsgFormat).indexOf(location.state)
            setMsgFormat({ value: Object.values(validMsgFormat)[index], label: Object.values(validMsgFormat)[index] });
        }
    }, [])

    const onFileSelect = (e: Option) => {
        //setLoadedMsg('');
        //setDecodeMsg('');
        //setMsgFormat('');
        if (e == null) {
            setSelectedFile(e);
            setLoadedMsg('');
            return;
        } else if (e.value == "file") {
            ref.current.value = '';
            ref.current?.click();
        } else {
            setSelectedFile(e);
            setFileName(e.label.split('.')[0]);

            const fmt = e.value.split('.')[1];
            dispatch(loadFile('messages', e.value))
                .then((loadFileVal) => {
                    if (loadFileVal.error) {
                        sbToastError(loadFileVal.payload.response);
                        return;
                    }

                    setMsgFormat({ value: fmt, label: fmt });
                    const data = loadFileVal.payload.data;
                    const formattedData = format(data, fmt, 2);
                    if (formattedData.startsWith('Error')) {
                        setLoadedMsg(data);
                    } else {
                        setLoadedMsg(formattedData);
                    }
                })
                .catch((loadFileErr) => {
                    sbToastError(loadFileErr.payload.data);
                })
        }
    };

    const onMsgChange = (data: any) => {
        //setSelectedFile('');
        // setDecodeMsg('');
        // setMsgFormat('');
        setLoadedMsg(data);
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length != 0) {
            const file = e.target.files[0];
            setSelectedFile({ 'value': file.name, 'label': file.name });

            const filename_only = getFilenameOnly(file.name);
            setFileName(filename_only);

            const type = getFilenameExt(file.name);

            const fileReader = new FileReader();
            fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                if (ev.target) {
                    let data = ev.target.result;
                    try {
                        //data = JSON.stringify(data, null, 2); // must turn str into obj before str
                        type == 'jadn' ? setMsgFormat({ value: 'json', label: 'json' }) : setMsgFormat({ value: type, label: type });
                        setLoadedMsg(data);
                    } catch (err) {
                        switch (type) {
                            case 'cbor':
                                data = escaped2cbor(hexify(data));
                                break;
                            default:
                                sbToastError(`File cannot be loaded: Invalid JSON`);
                        }
                    }
                }
            };
            fileReader.readAsText(file);
            // sbToastError(`Schema cannot be loaded. Please upload a message file.`);
        }
    }

    const onCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelectedFile('');
        setFileName('');
        setLoadedMsg('');
        if (ref.current) {
            ref.current.value = '';
        }
        //setDecodeMsg('');
        //setMsgFormat('');
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-3'>
                        <SBSelect id={"message-list"}
                            customClass={'mr-1'}
                            data={msgOpts}
                            onChange={onFileSelect}
                            placeholder={'Select a message...'}
                            loc={'messages'}
                            value={selectedFile}
                            isGrouped isFileUploader isSmStyle />
                        <div className='d-none'>
                            <SBFileUploader ref={ref} id={"message-file"} accept={".json,.jadn,.xml,.cbor"} onCancel={onCancelFileUpload} onChange={onFileChange} />
                        </div>
                    </div>

                    <div className={`col-md-3`}>
                        <SBSelect id={"message-format-list"}
                            customClass={'mr-1'}
                            data={validMsgFormat}
                            onChange={(e: Option) => setMsgFormat(e)}
                            value={msgFormat}
                            placeholder={'Message format...'}
                            isSmStyle
                        />
                    </div>

                    <div className='col-md-3'>
                        <SBSelect id={"message-decode-list"} data={decodeSchemaTypes.exports} onChange={(e: Option) => setDecodeMsg(e)}
                            value={decodeMsg}
                            placeholder={'Message type...'}
                            isSmStyle
                        />
                    </div>

                    <div className='col-md float-end'>
                        <SBCopyToClipboard buttonId='copyMessage' data={loadedMsg} customClass='float-right' />
                        <SBSaveFile data={loadedMsg} loc={'messages'} customClass={"float-right mr-1"} filename={fileName} ext={msgFormat ? msgFormat.value : 'json'} setDropdown={setSelectedFile} />
                        {isLoading ? <SBSpinner action={'Validating'} /> : <Button color="success" className={`float-right mr-1 btn-sm`} disabled={Object.keys(validSchema).length != 0 && loadedMsg && decodeMsg && msgFormat ? false : true} type="submit"
                            title={'Validate the message against the given schema'}>
                            Validate Message
                        </Button>}
                    </div>
                </div>
            </div>
            <div className="card-body-page">
                <SBEditor data={loadedMsg} convertTo={msgFormat ? msgFormat.value : ''} onChange={onMsgChange}></SBEditor>
            </div>
        </div>
    )
}

export default MessageValidated