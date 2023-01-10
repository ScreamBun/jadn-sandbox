import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Input } from "reactstrap";
import {
    escaped2cbor, format, hexify
} from '../utils';
import { loadFile } from "actions/util";
import { getMsgFiles } from "reducers/validate";

const ValidateMessage = (props: any) => {
    const { selectedFile, setSelectedFile, loadedMsg, setLoadedMsg, msgFormat, setMsgFormat, decodeSchemaTypes, decodeMsg, setDecodeMsg } = props;
    const [uploadedFile, setUploadedFile] = useState('');

    const msgOpts = useSelector(getMsgFiles);
    const decodeExports = decodeSchemaTypes.exports.map((dt: any) => <option key={dt} value={dt} >{dt}</option>);
    const decodeAll = decodeSchemaTypes.all.map((dt: any) => <option key={dt} value={dt} >{dt}</option>);
    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedFile == "" || selectedFile == "file") {
            setLoadedMsg('');
            setDecodeMsg('');
            setMsgFormat('');
            setUploadedFile('');
        } else {
            const fmt = selectedFile.split('.')[1];
            try {
                dispatch(loadFile('messages', selectedFile))
                    .then((loadFileVal) => {
                        setMsgFormat(fmt);
                        const data = loadFileVal.payload.data;
                        if (fmt == 'json') {
                            setLoadedMsg(JSON.stringify(data, null, 2));
                        } else {
                            const formattedData = format(data, fmt, 2);
                            if (formattedData.startsWith('Error')) {
                                setLoadedMsg(data);
                            } else {
                                setLoadedMsg(formattedData);
                            }
                        }
                    })
                    .catch((loadFileErr) => { setLoadedMsg(loadFileErr.payload.data) })
            } catch (err) {
                setLoadedMsg('');
            }
        }
    }, [selectedFile]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            const prefix = file.name.split('.')[0];
            const type = file.name.split('.')[1];

            if (prefix == 'message') {
                setUploadedFile(file.name);
                //read file
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
                                    toast(`File cannot be loaded`, { type: toast.TYPE.WARNING });
                            }
                        }
                        type == 'jadn' ? setMsgFormat('json') : setMsgFormat(type);
                        setLoadedMsg(data);
                    }
                };
                fileReader.readAsText(file);
            } else {
                toast(<p>Schema cannot be loaded. Please upload a message file.</p>, { type: toast.TYPE.WARNING });
            }
        }
    }

    return (
        <fieldset className="p-0">
            <legend>Message</legend>
            <div className="card">
                <div className="card-body p-0" style={{ height: '40em' }}>
                    <textarea
                        style={{
                            resize: 'none',
                            outline: 'none',
                            width: '100%',
                            padding: '10px',
                            border: 'none',
                            height: '100%'
                        }}
                        required
                        placeholder='Paste message to be validated here'
                        value={loadedMsg}
                        onChange={e => setLoadedMsg(e.target.value)}
                    />
                </div>

                <div className="card-footer p-2" style={{ height: '5em' }}>
                    <div className="form-row">

                        <div className="input-group col px-1 mb-0">
                            <select id="message-list" name="message-list" className="form-control mb-0" value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)} overflow-y="scroll">
                                <option value="">Message</option>
                                <optgroup label="Testers">
                                    {Object.entries(msgOpts).map(([n, t]) => <option key={n} value={n} data-decode={t} >{n}</option>)}
                                </optgroup>
                                <optgroup label="Custom">
                                    <option value="file">File...</option>
                                </optgroup>
                            </select>

                            <div id="message-file-group" className={`form-group col px-1 mb-0${selectedFile == 'file' ? '' : ' d-none'}`} >
                                <Input type="file" id="message-file" name="message-file" className="px-1 py-1" accept=".json,.jadn,.xml,.cbor" value={uploadedFile} onChange={handleFileChange} />
                            </div>
                        </div>


                        <div className="input-group col-md-3 px-1 mb-0">
                            <select className="form-control" id="message-format" name="message-format" required value={msgFormat} onChange={(e) => setMsgFormat(e.target.value)} >
                                <option value="">Message Format</option>
                                <option value="json">json</option>
                                <option value="cbor">cbor</option>
                                <option value="xml">xml</option>
                            </select>
                        </div>

                        <div className="input-group col-md-3 px-1 mb-0">
                            <select className="form-control" id="message-decode" name="message-decode" required value={decodeMsg} onChange={(e) => setDecodeMsg(e.target.value)}>
                                <option value="">Message Type</option>
                                <optgroup label="Exports">
                                    {decodeExports}
                                </optgroup>
                                <optgroup label="All">
                                    {decodeAll}
                                </optgroup>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </fieldset>)
}

export default ValidateMessage