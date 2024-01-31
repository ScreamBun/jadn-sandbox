import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
    escaped2cbor, format, hexify
} from '../utils';
import { getMsgFiles, getSelectedSchema, getValidMsgTypes } from "reducers/util";
import { sbToastError } from "components/common/SBToast";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import { useLocation } from "react-router-dom";
import SBSaveFile from "components/common/SBSaveFile";
import SBSelect, { Option } from "components/common/SBSelect";
import { getFilenameExt, getFilenameOnly } from "components/utils/general";
import { LANG_CBOR, LANG_JADN, LANG_JSON, LANG_XML } from "components/utils/constants";
import SBFileLoader from "components/common/SBFileLoader";
import SBSubmitBtn from "components/common/SBSubmitBtn";

const MessageValidated = (props: any) => {
    const location = useLocation();

    const { selectedFile, setSelectedFile, loadedMsg, setLoadedMsg, msgFormat, setMsgFormat, decodeSchemaTypes, decodeMsg, setDecodeMsg, isLoading, formId } = props;
    const validSchema = useSelector(getSelectedSchema);
    const [fileName, setFileName] = useState({
        name: '',
        ext: LANG_JADN
    });
    const msgOpts = useSelector(getMsgFiles);
    const validMsgFormat = useSelector(getValidMsgTypes)
    const ref = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (location.state) {
            const index = Object.values(validMsgFormat).indexOf(location.state)
            setMsgFormat({ value: Object.values(validMsgFormat)[index], label: Object.values(validMsgFormat)[index] });
        }
    }, [])

    const onFileLoad = async (dataFile?: any, fileStr?: Option) => {
        if (fileStr) {
            setSelectedFile(fileStr);
            const fileName = {
                name: getFilenameOnly(fileStr.label),
                ext: getFilenameExt(fileStr.label) || LANG_JSON
            }
            setFileName(fileName);
            if (dataFile) {
                fileName.ext == LANG_JADN ? setMsgFormat({ value: LANG_JSON, label: LANG_JSON }) : setMsgFormat({ value: fileName.ext, label: fileName.ext });
                const formattedData = format(dataFile, fileName.ext, 2);
                if (formattedData.startsWith('Error')) {
                    setLoadedMsg(dataFile);
                } else {
                    setLoadedMsg(formattedData);
                }
            } else {
                switch (fileName.ext) {
                    case 'cbor':
                        dataFile = escaped2cbor(hexify(dataFile));
                        break;
                    default:
                        sbToastError(`File cannot be loaded: Invalid JSON`);
                }
            }
        }
    };

    const onMsgChange = (data: any) => {
        //setSelectedFile('');
        // setDecodeMsg('');
        // setMsgFormat('');
        setLoadedMsg(data);
    }

    const onCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement> | null) => {
        if (e) {
            e.preventDefault();
        }
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
                            <SBFileLoader
                                customClass={'me-1'}
                                opts={msgOpts}
                                selectedOpt={selectedFile}
                                fileName={fileName}
                                setSelectedFile={setSelectedFile}
                                onCancelFileUpload={onCancelFileUpload}
                                onFileChange={onFileLoad}
                                acceptableExt={[LANG_JSON, LANG_XML, LANG_CBOR]}
                                ref={ref}
                                placeholder={'Select a data file...'}
                                loc={'messages'}
                            />
                            <SBSelect id={"data-format-list"}
                                customClass={'me-1'}
                                data={validMsgFormat}
                                onChange={(e: Option) => setMsgFormat(e)}
                                value={msgFormat}
                                placeholder={'Data format...'}
                                isSmStyle
                                isClearable />
                            <SBSelect id={"data-decode-list"}
                                customClass={'me-1'}
                                data={decodeSchemaTypes.exports}
                                onChange={(e: Option) => setDecodeMsg(e)}
                                value={decodeMsg}
                                placeholder={'Data type...'}
                                isSmStyle
                                isClearable
                                customNoOptionMsg={'Select a schema to begin'} />
                        </div>
                    </div>

                    <div className='col-sm-4 align-self-center'>
                        <div className='d-flex float-end'>
                            <SBSubmitBtn buttonId="validateSchema"
                                buttonTitle="Validate the data against the given schema"
                                buttonTxt="Validate"
                                customClass="me-1 float-end"
                                isLoading={isLoading}
                                formId={formId}
                                isDisabled={Object.keys(validSchema).length != 0 && loadedMsg && decodeMsg && msgFormat ? false : true}>
                            </SBSubmitBtn>
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