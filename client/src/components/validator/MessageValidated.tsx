import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "reactstrap";
import {
    escaped2cbor, format, hexify
} from '../utils';
import { loadFile } from "actions/util";
import { getMsgFiles } from "reducers/util";
import { sbToastError } from "components/common/SBToast";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import { useLocation } from "react-router-dom";
import { isNull } from "lodash";
import SBFileUploader from "components/common/SBFileUploader";

const MessageValidated = (props: any) => {
    const location = useLocation()
    const { navMsgFormat } = location.state

    const { selectedFile, setSelectedFile, loadedMsg, setLoadedMsg, msgFormat, setMsgFormat, decodeSchemaTypes, decodeMsg, setDecodeMsg, loadedSchema } = props;

    const msgOpts = useSelector(getMsgFiles);
    const decodeExports = decodeSchemaTypes.exports.map((dt: any) => <option key={dt} value={dt} >{dt}</option>);
    //const decodeAll = decodeSchemaTypes.all.map((dt: any) => <option key={dt} value={dt} >{dt}</option>);
    const dispatch = useDispatch();
    const ref = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!isNull(navMsgFormat)) {
            setMsgFormat(navMsgFormat);
        }
    }, [])

    const onFileSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFile(e.target.value);
        if (e.target.value == "" || e.target.value == "file") {
            setLoadedMsg('');
            setDecodeMsg('');
            setMsgFormat('');
        } else {
            const fmt = e.target.value.split('.')[1];
            try {
                dispatch(loadFile('messages', e.target.value))
                    .then((loadFileVal) => {
                        setMsgFormat(fmt);
                        const data = loadFileVal.payload.data;
                        const formattedData = format(data, fmt, 2);
                        if (formattedData.startsWith('Error')) {
                            setLoadedMsg(data);
                        } else {
                            setLoadedMsg(formattedData);
                        }
                    })
                    .catch((loadFileErr) => {
                        setLoadedMsg(loadFileErr.payload.data);
                    })
            } catch (err) {
                setLoadedMsg('');
            }
        }
    };

    const onMsgChange = (data: any) => {
        setSelectedFile('empty');
        // setDecodeMsg('');
        // setMsgFormat('');
        setLoadedMsg(data);
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            //const prefix = file.name.split('.')[0];
            const type = file.name.split('.')[1];

            const fileReader = new FileReader();
            fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                if (ev.target) {
                    let data = ev.target.result;
                    try {
                        //data = JSON.stringify(data, null, 2); // must turn str into obj before str
                        type == 'jadn' ? setMsgFormat('json') : setMsgFormat(type);
                        setLoadedMsg(data);
                    } catch (err) {
                        switch (type) {
                            case 'cbor':
                                data = escaped2cbor(hexify(data));
                                break;
                            default:
                                sbToastError(`File cannot be loaded`);
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
                    <div className={`${selectedFile == 'file' ? 'col-md-6' : ' col-md-3'}`}>
                        <div className={`${selectedFile == 'file' ? ' d-none' : ''}`}>
                            <select id="message-list" name="message-list" className="form-control form-control-sm" value={selectedFile} onChange={onFileSelect}>
                                <option value="">Message</option>
                                <optgroup label="Testers">
                                    {Object.entries(msgOpts).map(([n, t]) => <option key={n} value={n} data-decode={t} >{n}</option>)}
                                </optgroup>
                                <optgroup label="Custom">
                                    <option value="file">File...</option>
                                </optgroup>
                            </select>
                        </div>
                        <div className={`${selectedFile == 'file' ? '' : ' d-none'}`} style={{ display: 'inline' }}>
                            <SBFileUploader ref={ref} id={"message-file"} accept={".json,.jadn,.xml,.cbor"} onCancel={onCancelFileUpload} onChange={onFileChange} />
                        </div>
                    </div>

                    <div className={`col-md-3 ${selectedFile == '' || selectedFile == 'empty' ? '' : ' d-none'}`}>
                        <select className="form-control form-control-sm" id="message-format" name="message-format" required value={msgFormat} onChange={(e) => setMsgFormat(e.target.value)}
                            title="Select programming language of message">
                            <option value="">Message Format</option>
                            <option value="json">json</option>
                            <option value="cbor">cbor</option>
                            <option value="xml">xml</option>
                        </select>
                    </div>

                    <div className='col-md-3'>
                        <select className="form-control form-control-sm" id="message-decode" name="message-decode" required value={decodeMsg} onChange={(e) => setDecodeMsg(e.target.value)}
                            title="Select message type to validate against">
                            <option value="">Message Type</option>
                            <optgroup label="Exports">
                                {decodeExports}
                            </optgroup>
                            {/* <optgroup label="All">
                                {decodeAll}
                            </optgroup> */}
                        </select>
                    </div>

                    <div className='col-md float-end'>
                        <SBCopyToClipboard buttonId='copyMessage' data={loadedMsg} customClass='float-right' />
                        <Button color="success" className={`float-right mr-1 btn-sm ${loadedSchema && loadedMsg && decodeMsg && msgFormat ? '' : ' disabled'}`} type="submit"
                            title={'Validate the message against the given schema'}>
                            Validate Message
                        </Button>
                    </div>
                </div>
            </div>
            <div className="card-body p-0">
                <SBEditor data={loadedMsg} convertTo={msgFormat} onChange={onMsgChange}></SBEditor>
            </div>
        </div>
    )
}

export default MessageValidated