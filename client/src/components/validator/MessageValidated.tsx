import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { LANG_JADN, LANG_JSON } from "components/utils/constants";

const MessageValidated = (props: any) => {
    const location = useLocation();

    const { selectedFile, setSelectedFile, loadedMsg, setLoadedMsg, msgFormat, setMsgFormat, decodeSchemaTypes, decodeMsg, setDecodeMsg, isLoading } = props;
    const validSchema = useSelector(getSelectedSchema);
    const [fileName, setFileName] = useState({
        name: '',
        ext: LANG_JADN
    });
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
            const fileName = {
                name: getFilenameOnly(e.label),
                ext: getFilenameExt(e.label)
            }
            setFileName(fileName);
            dispatch(loadFile('messages', e.value))
                .then((loadFileVal) => {
                    if (loadFileVal.error) {
                        sbToastError(loadFileVal.payload.response);
                        return;
                    }

                    setMsgFormat({ value: fileName.ext, label: fileName.ext });
                    const data = loadFileVal.payload.data;
                    const formattedData = format(data, fileName.ext, 2);
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
            const fileName = {
                name: getFilenameOnly(file.name),
                ext: getFilenameExt(file.name)
            }
            setFileName(fileName);

            const fileReader = new FileReader();
            fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                if (ev.target) {
                    let data = ev.target.result;
                    try {
                        //data = JSON.stringify(data, null, 2); // must turn str into obj before str
                        fileName.ext == LANG_JADN ? setMsgFormat({ value: LANG_JSON, label: LANG_JSON }) : setMsgFormat({ value: fileName.ext, label: fileName.ext });
                        setLoadedMsg(data);
                    } catch (err) {
                        switch (fileName.ext) {
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
            // sbToastError(`Schema cannot be loaded. Please upload a data file.`);
        }
    }

    const onCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelectedFile('');
        setFileName({
            name: '',
            ext: LANG_JADN
        });
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
                    <div className='col-sm-8'>
                        <div className="d-flex">
                            <SBSelect id={"data-list"}
                                customClass={'me-1'}
                                data={msgOpts}
                                onChange={onFileSelect}
                                placeholder={'Select a data file...'}
                                loc={'messages'}
                                value={selectedFile}
                                isGrouped isFileUploader isSmStyle />
                            <div className='d-none'>
                                <SBFileUploader ref={ref} id={"data-file"} accept={".json,.jadn,.xml,.cbor"} onCancel={onCancelFileUpload} onChange={onFileChange} />
                            </div>
                            {/* </div> */}

                            {/* <div className={`col-md-3`}> */}
                            <SBSelect id={"data-format-list"}
                                customClass={'me-1'}
                                data={validMsgFormat}
                                onChange={(e: Option) => setMsgFormat(e)}
                                value={msgFormat}
                                placeholder={'Data format...'}
                                isSmStyle
                            />
                            {/* </div> */}

                            {/* <div className='col-md-3'> */}
                            <SBSelect id={"data-decode-list"}
                                customClass={'me-1'}
                                data={decodeSchemaTypes.exports}
                                onChange={(e: Option) => setDecodeMsg(e)}
                                value={decodeMsg}
                                placeholder={'Data type...'}
                                isSmStyle
                            />
                        </div>
                    </div>

                    <div className='col-sm-4'>
                        <div className='d-flex float-end'>
                            {isLoading ? <SBSpinner action={'Validating'} /> :
                                <button className='float-end me-1 btn btn-success btn-sm'
                                    disabled={Object.keys(validSchema).length != 0 && loadedMsg && decodeMsg && msgFormat ? false : true}
                                    type="submit"
                                    title={'Validate the data against the given schema'}>
                                    Validate
                                </button>}
                            <SBCopyToClipboard buttonId='copyData' data={loadedMsg} customClass='float-end me-1' />
                            <SBSaveFile data={loadedMsg} loc={'messages'} customClass={"float-end"} filename={fileName.name} ext={msgFormat ? msgFormat.value : LANG_JSON} setDropdown={setSelectedFile} />
                        </div>
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