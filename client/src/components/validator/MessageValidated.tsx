import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "reactstrap";
import {
    escaped2cbor, format, hexify
} from '../utils';
import { loadFile } from "actions/util";
import { getMsgFiles } from "reducers/util";
import { sbToastError } from "components/common/SBToast";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";

const MessageValidated = (props: any) => {
    const { selectedFile, setSelectedFile, loadedMsg, setLoadedMsg, msgFormat, setMsgFormat, decodeSchemaTypes, decodeMsg, setDecodeMsg } = props;

    const msgOpts = useSelector(getMsgFiles);
    const decodeExports = decodeSchemaTypes.exports.map((dt: any) => <option key={dt} value={dt} >{dt}</option>);
    const decodeAll = decodeSchemaTypes.all.map((dt: any) => <option key={dt} value={dt} >{dt}</option>);
    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedFile == "" || selectedFile == "file") {
            setLoadedMsg('');
            setDecodeMsg('');
            setMsgFormat('');
        } else {
            const fmt = selectedFile.split('.')[1];
            try {
                dispatch(loadFile('messages', selectedFile))
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
                    .catch((loadFileErr) => { setLoadedMsg(loadFileErr.payload.data) })
            } catch (err) {
                setLoadedMsg('');
            }
        }
    }, [selectedFile]);

    const onMsgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFile('empty');
        setDecodeMsg('');
        setMsgFormat('');
        setLoadedMsg(e.target.value);

    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            const prefix = file.name.split('.')[0];
            const type = file.name.split('.')[1];

            if (prefix == 'message') {
                const fileReader = new FileReader();
                fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                    if (ev.target) {
                        let data = ev.target.result;
                        try {
                            data = JSON.stringify(data, null, 2); // must turn str into obj before str
                        } catch (err) {
                            switch (type) {
                                case 'cbor':
                                    data = escaped2cbor(hexify(data));
                                    break;
                                default:
                                    sbToastError(`File cannot be loaded`);
                            }
                        }
                        type == 'jadn' ? setMsgFormat('json') : setMsgFormat(type);
                        setLoadedMsg(data);
                    }
                };
                fileReader.readAsText(file);
            } else {
                sbToastError(`Schema cannot be loaded. Please upload a message file.`);
            }
        }
    }

    return (
        <fieldset className="p-0">
            <legend>Message</legend>
            <div className="card">
                <div className="card-body p-0" style={{ height: '40em' }}>
                    <Input
                        id="messageInput"
                        type="textarea"
                        onChange={onMsgChange}
                        value={loadedMsg}
                        className='form-control form-control-sm'
                        placeholder='Paste or load message here to be validated'
                        style={{
                            resize: 'none',
                            outline: 'none',
                            width: '100%',
                            padding: '10px',
                            border: 'none',
                            height: '100%',
                            whiteSpace: 'pre',
                            overflowWrap: 'normal',
                            overflowX: 'auto'  
                        }}
                        required
                    />
                </div>

                <div className="card-footer p-1">
                    <div className="form-row">

                        <div className="col px-1 mb-0">
                            <select id="message-list" name="message-list" className="form-control form-control-sm" value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)} overflow-y="scroll">
                                <option value="">Message</option>
                                <optgroup label="Testers">
                                    {Object.entries(msgOpts).map(([n, t]) => <option key={n} value={n} data-decode={t} >{n}</option>)}
                                </optgroup>
                                <optgroup label="Custom">
                                    <option value="file">File...</option>
                                </optgroup>
                            </select>
                            <Input type="file" id="message-file" name="message-file" className={`form-control form-control-sm ${selectedFile == 'file' ? '' : ' d-none'}`} accept=".json,.jadn,.xml,.cbor" onChange={handleFileChange} />
                        </div>

                        <div className={`col ${selectedFile == '' || selectedFile == 'empty' ? '' : ' d-none'}`}>
                            <select className="form-control form-control-sm" id="message-format" name="message-format" required value={msgFormat} onChange={(e) => setMsgFormat(e.target.value)}>
                                <option value="">Message Format</option>
                                <option value="json">json</option>
                                <option value="cbor">cbor</option>
                                <option value="xml">xml</option>
                            </select>
                        </div>

                        <div className="col">
                            <div className="row">
                                <div className="col-8">
                                    <select className="form-control form-control-sm" id="message-decode" name="message-decode" required value={decodeMsg} onChange={(e) => setDecodeMsg(e.target.value)}>
                                        <option value="">Message Type</option>
                                        <optgroup label="Exports">
                                            {decodeExports}
                                        </optgroup>
                                        <optgroup label="All">
                                            {decodeAll}
                                        </optgroup>
                                    </select>
                                </div>
                                <div className="col-4">
                                    <SBCopyToClipboard buttonId='copyMessage' data={loadedMsg} customClass='float-right' />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </fieldset>)
}

export default MessageValidated