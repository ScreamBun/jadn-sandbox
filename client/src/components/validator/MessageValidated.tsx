import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Input } from "reactstrap";
import {
    escaped2cbor, format, hexify
} from '../utils';
import { loadFile } from "actions/util";
import { getMsgFiles } from "reducers/util";
import { sbToastError } from "components/common/SBToast";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import { LANG_JSON } from "components/utils/constants";
import SBEditor from "components/common/SBEditor";

const MessageValidated = (props: any) => {
    const { selectedFile, setSelectedFile, loadedMsg, setLoadedMsg, msgFormat, setMsgFormat, decodeSchemaTypes, decodeMsg, setDecodeMsg, loadedSchema } = props;

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

    const onMsgChange = () => {
        setSelectedFile('empty');
        setDecodeMsg('');
        setMsgFormat('');
        // setLoadedMsg(e.target.value);

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
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-3'>
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
                            <optgroup label="All">
                                {decodeAll}
                            </optgroup>
                        </select>
                    </div>

                    <div className={`${selectedFile == '' || selectedFile == 'empty' ? 'col-md-3' : 'col-md-6'}`}>
                        <SBCopyToClipboard buttonId='copyMessage' data={loadedMsg} customClass='float-right' />
                        <Button color="success" className={`float-right mr-1 btn-sm ${loadedSchema && loadedMsg && decodeMsg && msgFormat ? '' : ' disabled'}`} type="submit"
                            title={`${loadedSchema && loadedMsg && decodeMsg && msgFormat ? 'Validate the message against the given schema' : 'Cannot validate'}`}>
                            Validate Message
                        </Button>
                    </div>
                </div>
            </div>
            <div className="card-body p-0">
                <SBEditor data={loadedMsg} setData={setLoadedMsg} lang={LANG_JSON} onEditorChange={onMsgChange}></SBEditor>                  
            </div>
        </div>
    )
}

export default MessageValidated